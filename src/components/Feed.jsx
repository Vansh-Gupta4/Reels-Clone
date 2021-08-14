/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import FavouriteIcon from "@material-ui/icons/Favorite";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import Overlay from "./Overlay";
import uuid from "react-uuid";
import { database, storage } from "../firebase";
import Header from "./Header";
import Dialog from "@material-ui/core/Dialog";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Comments from "./Comments";
import AddComment from "./AddComment";
function Feed() {
  const useStyles = makeStyles((theme) => ({
    root: {
      marginTop: "100px",
      "& > *": {
        margin: theme.spacing(1),
      },
    },
    input: {
      display: "none",
    },
    videoContainer: {
      position: "relative",
      display: "flex",
    },

    notSelected: {
      color: "white",
    },
    liked: {
      color: "red",
    },
    videoActionsIconsContainer: {
      display: "flex",
      width: "7rem",
      justifyContent: "space-around",
    },
    videoDescriptionSection: {
      position: "absolute",
      bottom: "2rem",
      left: "0.5rem",
      minHeight: "5rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
    },
    seeComments: {
      height: "54vh",
      overflowY: "auto",
    },
  }));
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [pageLoading, setpageLoading] = useState(true);
  const { signout, currentUser } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [isLiked, setLiked] = useState(false);
  const [openId, setOpenId] = useState(null);

  const handleInputFile = (e) => {
    e.preventDefault();
    let file = e?.target?.files[0];
    if (file != null) {
      console.log(e.target.files[0]);
    }
    if (file.size / (1024 * 1024) > 20) {
      alert("The selected file is very big");
      return;
    }
    //STEP 1. upload
    const uploadTask = storage.ref(`/posts/${uuid()}`).put(file);
    setLoading(true);
    //   progress
    const f1 = (snapshot) => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes;
      console.log(progress);
      //this callback is for providing the progress
    };

    // err
    const f2 = () => {
      alert("There was an error in uploading the file");
      return;
    };

    // success
    const f3 = () => {
      uploadTask.snapshot.ref.getDownloadURL().then(async (url) => {
        //STEP 2.
        // post collection -> post document put
        let obj = {
          comments: [],
          likes: [],
          url,
          auid: currentUser.uid,
          createdAt: database.getUserTimeStamp(),
        };
        //   put the post object into post collection
        let postObj = await database.posts.add(obj);

        //STEP 3. user postsId -> new post id put
        await database.users.doc(currentUser.uid).update({
          postIds: [...user.postIds, postObj.id],
        });
        console.log(postObj);
        setLoading(false);
      });
    };
    uploadTask.on("state_changed", f1, f2, f3);
  };

  const handleLiked = async (puid, liked) => {
    // console.log(puid);
    let postRef = await database.posts.doc(puid).get();
    let post = postRef.data();
    console.log(post);
    let likes = post.likes;
    console.log(liked);
    if (liked == false) {
      database.posts.doc(puid).update({
        likes: [...likes, currentUser.uid],
      });
      setLiked(true);
    } else {
      console.log("inside");
      let likes = post.likes.filter((lkuid) => {
        return lkuid != currentUser.uid;
      });
      database.posts.doc(puid).update({
        likes: likes,
      });
      setLiked(false);
    }
  };

  const handleCommentClicked = async (puid) => {
    setOpenId(puid);
  };
  const handleClose = () => {
    setOpenId(null);
  };

  // componentdidmount
  useEffect(async () => {
    console.log(currentUser.uid);
    // profile page -> change
    // resource intensive
    // database.users.doc(currentUser.uid).onSnapshot((snapshot) => {
    //     console.log(snapshot.data());
    //     setUser(snapshot.data());
    //     setpageLoading(false);
    // })
    // how get a document from a collection in firebase
    // auth user doen't contains any other data besides email ,password , uid
    //  you need to get the complete document from  the firstore using either of email or uid
    let dataObject = await database.users.doc(currentUser.uid).get();
    // console.log(dataPromise.data());
    setUser(dataObject.data());
    setpageLoading(false);
  }, []);

  // post get
  useEffect(async () => {
    let unsub = await database.posts
      .orderBy("createdAt", "desc") // "desc" ki wajah se descending order mai aayegi videos
      .onSnapshot(async (snapshot) => {
        console.log(snapshot);
        let videos = snapshot.docs.map((doc) => doc.data());
        // Extract videosURL from post collection and user's data from user collection
        // ProfileImg of the author of the post(video)
        let videosArr = [];
        for (let i = 0; i < videos.length; i++) {
          let videoUrl = videos[i].url;
          // console.log(videos[i]);
          let auid = videos[i].auid;
          let id = snapshot.docs[i].id;
          let likes = videos[i].likes;
          let comments = videos[i].comments;
          // console.log(id);
          let userObject = await database.users.doc(auid).get();
          let userProfileUrl = userObject.data().profileUrl;
          let userName = userObject.data().username;
          videosArr.push({
            videoUrl,
            userProfileUrl,
            userName,
            puid: id,
            liked: likes.includes(currentUser.uid),
            isOverlayActive: false,
            comments,
          });
        }
        setVideos(videosArr); // Set Received videos for further dispaly in feed
      });
    return unsub;
  }, []);

  let scrollAndVideoActionObserver;
  useEffect(() => {
    let allPosts = document.querySelectorAll("video");

    let scrollAndVideoActionConditionObject = {
      root: null,
      rootMargin: "0px",
      threshold: "0.5",
    };
    function scrollAndVideoActionCallback(entries) {
      entries.forEach((entry) => {
        let post = entry.target;
        // Initially play all the post videos,
        // Then analyse if the post video intersects, if it doesn't then we need to pause it
        post.play().then(() => {
          if (entry.isIntersecting === false) {
            post.pause();
          }
        });
      });
      entries.forEach((entry) => {
        let post = entry.target;
        if (entry.isIntersecting) {
          let postDimensions = post.getBoundingClientRect();
          window.scrollBy({
            top: postDimensions.top,
            left: postDimensions.left,
            behavior: "smooth",
          });
        }
      });
    }

    if (scrollAndVideoActionObserver) {
      scrollAndVideoActionObserver.disconnect();
    }
    scrollAndVideoActionObserver = new IntersectionObserver(
      scrollAndVideoActionCallback,
      scrollAndVideoActionConditionObject
    );
    allPosts.forEach((post, idx) => {
      scrollAndVideoActionObserver.observe(post);
    });
  }, [videos]);

  return pageLoading == true ? (
    <div>Loading....</div>
  ) : (
    <div>
      <div className="navbar">
        <Header></Header>
      </div>

      <div className="uploadImage">
        <div className={classes.root}>
          <input
            accept="file"
            className={classes.input}
            id="icon-button-file"
            type="file"
            onChange={handleInputFile}
          />
          <label htmlFor="icon-button-file">
            <Button
              variant="contained"
              color="primary"
              component="span"
              disabled={loading}
              endIcon={<PhotoCamera />}
            >
              Upload
            </Button>
          </label>
        </div>
      </div>

      <div className="feed">
        {videos.map((videoObj) => {
          console.log(videoObj);
          return (
            <div className={classes.videoContainer}>
              <Video
                src={videoObj.videoUrl}
                id={videoObj.puid}
                userName={videoObj.userName}
              ></Video>

              <div className={classes.videoDescriptionSection}>
                <div>
                  <Avatar
                    alt="Profile"
                    style={{ height: "2.5rem" }}
                    src={videoObj?.userProfileUrl}
                  />
                  <div
                    style={{
                      padding: "0.5rem",
                      color: "#ffffff",
                      fontFamily: "",
                    }}
                  >
                    <span
                      style={{
                        borderRadius: "5px",
                        fontWeight: "bold",
                        fontSize: "8px",
                      }}
                    >
                      <h1>{videoObj.userName}</h1>
                    </span>
                  </div>
                </div>

                <div className={classes.videoActionsIconsContainer}>
                  <FavouriteIcon
                    className={[
                      videoObj.liked == false
                        ? classes.notSelected
                        : classes.liked,
                    ]}
                    onClick={() => {
                      handleLiked(videoObj.puid, videoObj.liked);
                    }}
                  ></FavouriteIcon>

                  <ChatBubbleIcon
                    className={[classes.notSelected]}
                    onClick={() => {
                      handleCommentClicked(videoObj.puid);
                    }}
                  ></ChatBubbleIcon>
                </div>
              </div>
              {/*when user clicks */}
              <Dialog
                maxWidth="md"
                onClose={handleClose}
                open={openId === videoObj.puid}
              >
                <MuiDialogContent>
                  <div className="dcontainer" style={{ display: "flex" }}>
                    <div
                      className="video-part"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "35vw",
                      }}
                    >
                      <video
                        autoPlay={true}
                        className="video-styles2"
                        controls
                        id={videoObj.puid}
                        muted="muted"
                        type="video/mp4"
                        style={{ height: "80vh", width: "35vw" }}
                      >
                        <source src={videoObj.videoUrl} type="video/webm" />
                      </video>
                    </div>
                    <div
                      className="info-part"
                      style={{ flexGrow: "1", flexBasis: "0", width: "42vw" }}
                    >
                      <Card>
                        <CardHeader
                          avatar={
                            <Avatar
                              src={videoObj?.userProfileUrl}
                              aria-label="recipe"
                              className={classes.avatar}
                            ></Avatar>
                          }
                          action={
                            <IconButton aria-label="settings">
                              <MoreVertIcon />
                            </IconButton>
                          }
                          title={videoObj?.userName}
                        />
                        <hr
                          style={{
                            border: "none",
                            height: "1px",
                            color: "#dfe6e9",
                            backgroundColor: "#dfe6e9",
                          }}
                        />
                        <CardContent className={classes.seeComments}>
                          <Comments postData={videoObj} />
                        </CardContent>
                      </Card>

                      <div className="extra">
                        <div className="likes">
                          <Typography className={classes.typo} variant="body2">
                            Liked By{" "}
                            {videoObj.liked.length == 0 ? "nobody" : ` others`}
                          </Typography>
                        </div>

                        <AddComment userData={user} postData={videoObj} />
                      </div>
                    </div>
                  </div>
                </MuiDialogContent>
              </Dialog>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Video(props) {
  console.log(props.userName);
  return (
    <>
      <video
        style={{
          height: "85vh",
          borderRadius: "2rem",
          marginTop: "2rem",
        }}
        autoPlay
        muted="true"
        id={props.id}
        onClick={handlePostSound}
        onEnded={onVideoEnd}
      >
        <source src={props.src} type="video/mp4"></source>
      </video>
    </>
  );
}
function handlePostSound(e) {
  e.target.muted = !e.target.muted;
}
function onVideoEnd(e) {
  let nextVideoSiblingParent = e.target.parentElement.nextSibling;
  if (nextVideoSiblingParent) {
    let videoDimensions =
      nextVideoSiblingParent.children[0].getBoundingClientRect();
    window.scrollBy({
      top: videoDimensions.top,
      left: videoDimensions.left,
      behavior: "smooth",
    });
  }
}
export default Feed;
