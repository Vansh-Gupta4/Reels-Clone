/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useContext } from 'react';
import { makeStyles, Grid, Avatar, Container, Divider, CircularProgress } from '@material-ui/core';
import LikeIcon from '@material-ui/icons/FavoriteBorder';
import HeaderBar from './Header';
import { AuthContext } from '../contexts/AuthProvider';
import { database } from '../firebase';

function Profile() {
    const useStyles = makeStyles({
        imageSection: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        userImageIcon: {
            boxShadow: "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset",
            height: "8rem",
            width: "8rem",
        },
        userName: {
            fontFamily: "Quicksand, sans-serif",
            fontSize: "xx-large",
            color: "#485460",
        },
        userDescription: {
            lineHeight: "2",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        },
        videoSection: {
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            marginTop: "2rem",
            gap: "2rem",
        },
        videoContainer: {
            position: "relative",
        },
        overlayContainer: {
            position: "absolute",
            left: "0",
            top: "0",
            width: "100%",
            height: "100%",
            fontWeight: "lighter",
            fontFamily: "Roboto, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: '#fff',
            backgroundColor: "#211e1e8c",
            opacity: "0",
            zIndex: "2",
        },
    })

    const classes = useStyles();

    const [user, setUser] = useState();
    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [videos, setVideos] = useState([]);
    const { currentUser } = useContext(AuthContext);

    useEffect(async () => {      // Get currentuser Data
        let dataObject = await database.users.doc(currentUser.uid).get();
        setUser(dataObject.data());
        setPageLoading(false);
    }, [])

    useEffect(async () => {    // Get all posts to display in feed
        setLoading(true);
      // Since snapshot is realtime we receive from unsubscribe function which has to be returned during cleanup
        let unsubscribe =
            await database.posts
                .onSnapshot(async snapshot => {
                    let videos = snapshot.docs.map(doc => doc.data());
                    // Extract videosURL from post collection and user's data from user collection
                    // ProfileImg of the author of the post(video)
                    let videosDataArrFromFireStore = [];
                    for (let i = 0; i < videos.length; i++) {
                        let { url: videoUrl, auid, likes, videoDescription } = videos[i];
                        let puid = snapshot.docs[i].id;
                        let userObject = await database.users.doc(auid).get();
                        let { profileImageURL: userProfileImageURL, username } = userObject.data();

                        // For likes, check if current user has liked the post
                        if (auid === currentUser.uid)
                        videosDataArrFromFireStore.push({  videoUrl,  puid, likesCount: likes.length,});
                    }
                    setLoading(false);
                    // Set Received videos for further dispaly in feed
                    setVideos(videosDataArrFromFireStore);
                })      
    }, [])

    return (       
        pageLoading == true ? <CircularProgress color="secondary" className={classes.circularLoader} /> :
            <Container style={{ backgroundColor: "", width: "60vw", marginTop: "5rem" }}>
                <HeaderBar loading={loading} setLoading={setLoading} user={user}></HeaderBar>
                <Grid container style={{ minHeight: "30vh", marginBottom: "3rem" }}>
                    <Grid item xs={12} sm={12} md={5} lg={5}
                        className={classes.imageSection}>
                        <Avatar alt="Profile" src={user?.profileUrl} className={classes.userImageIcon} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={7} lg={7} className={classes.userDescription}>
                        <div>
                            <div className={classes.userName}>{user.username}</div>
                            <div style={{display:"flex"}}>
                            <div style={{ color: "#485460" }}>
                                <span style={{ fontWeight: "500", color: "#3d3d3d", fontSize: "large" }}>{user.postIds.length}</span> posts
                            </div>
                            <div style={{ color: "#485460" }}>
                                <span style={{ fontWeight: "500", color: "#3d3d3d", fontSize: "large",marginLeft:"10px" }}>342</span> Followers
                            </div>
                            <div style={{ color: "#485460" }}>
                                <span style={{ fontWeight: "500", color: "#3d3d3d", fontSize: "large",marginLeft:"10px" }}>209</span> Following
                            </div>
                            </div>
                        </div>
                    </Grid>
                </Grid>

                <Divider />

                <div className={classes.videoSection}>
                    {
                        // <h1>Hello</h1>
                        videos.map(videoObj => {
                            return (
                                <div className={classes.videoContainer}>
                                    <Video  src={videoObj.videoUrl}  id={videoObj.puid}  key={videoObj.puid}
                                    ></Video>
                                    <div className={classes.overlayContainer} onMouseOver={(e) => e.currentTarget.style.opacity = "1"}  onMouseOut={(e) => e.currentTarget.style.opacity = "0"}  onClick={handlePostSound}>
                                        <LikeIcon />&nbsp;{videoObj.likesCount} {videoObj.likesCount === 1 ? "like" : "likes"}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </Container>
    )
}

function Video(props) {
    return (
        <video id={props.id} loop width="250" muted={true} autoPlay style={{ minHeight: "100%" }}src={props.src}></video>
    )
}

function handlePostSound(e) {
    e.currentTarget.previousSibling.muted = !e.currentTarget.previousSibling.muted;
}

export default Profile;