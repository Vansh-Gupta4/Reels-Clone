/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../contexts/AuthProvider";
import InstaLogo from "../Assets/Instagram.JPG";
import { useHistory } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import HomeIcon from "@material-ui/icons/Home";
import ExploreOutlinedIcon from "@material-ui/icons/ExploreOutlined";
import { Menu, MenuItem, Fade } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import { database, storage } from "../firebase";
import { Link } from "react-router-dom";
import "./Header.css";
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(2)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
    border: "1px solid #636e72",
    color: "#636e72",
    height: "10px",
    borderRadius: "5%",
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
    color: "#636e72",
    marginRight: "15%",
    marginLeft: "1%",
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  appb: {
    backgroundColor: "white",
  },
  navicon: {
    color: "black",
    marginRight: "1%",
    cursor: "pointer",
  },
  navicon2: {
    color: "black",
    cursor: "pointer",
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

export default function Header(props) {
  const classes = useStyles();
  const history = useHistory();
  const [user, setUser] = useState();
  const { signout, currentUser } = useContext(AuthContext);
  const [pageLoading, setpageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleAnchorElClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSignOut = async (e) => {
    try {
      setLoading(true);
      await signout();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const handleBannerClick = () => {
    history.push("/");
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

  return (
    <div className={classes.grow}>
      <AppBar className={classes.appb} position="fixed">
        <Toolbar>
          <div className="insta-head2">
            <img src={InstaLogo} onClick={handleBannerClick} style={{ cursor: "pointer" }}/>
          </div>

          <div className={classes.grow} />
          <HomeIcon onClick={handleBannerClick} className={classes.navicon} />
          <ExploreOutlinedIcon className={classes.navicon2} />
          <div className={classes.sectionDesktop}>
            <Avatar alt="Remy Sharp" src={user?.profileUrl} className={classes.small} onClick={handleAnchorElClick}/>
          </div>
          <Menu id="fade-menu" anchorEl={anchorEl} keepMounted open={open} onClose={handleClose} TransitionComponent={Fade}>
            <MenuItem>
              <Link style={{textDecoration: "none",color: "inherit",padding: "0",}} to="/profile">
                Profile
              </Link>
            </MenuItem>
            <MenuItem onClick={handleSignOut}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </div>
  );
}
