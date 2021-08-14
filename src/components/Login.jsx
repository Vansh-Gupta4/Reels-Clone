import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TextField,
  makeStyles,
  Grid,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  Container,
  CardMedia,
  Typography,
} from "@material-ui/core";

import { AuthContext } from "../contexts/AuthProvider";
import Insta from "../Assets/insta.png";
import { CarouselProvider, Slider, Slide, Image } from "pure-react-carousel";
import Img1 from "../Assets/img1.jpg";
import Img2 from "../Assets/img2.jpg";
import Img3 from "../Assets/img3.jpg";
import Img4 from "../Assets/img4.jpg";
import Img5 from "../Assets/img5.jpg";
import InstaLogo from "../Assets/Instagram.JPG";
import "pure-react-carousel/dist/react-carousel.es.css";
function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loader, setLoader] = useState(false);
  let { login } = useContext(AuthContext);
  let useStyles = makeStyles({
    root: {
      width: "100%",
    },

    fullWidth: {
      width: "100%",
    },
    mb: {
      marginBottom: "0.5rem",
    },
    image: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  });
  const handleSubmit = async (e) => {
    // alert(email + password);
    e.preventDefault();
    try {
      // async
      setLoader(true);
      let res = await login(email, password);
      setLoader(false);
      props.history.push("/");
    } catch (err) {
      setError(true);
      setLoader(false);
      setEmail("");
      setPassword("");
    }
  };
  let classes = useStyles();
  return (
    <div
      className="login-container"
      style={{
        marginTop: "8vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        className="imgcar"
        style={{
          backgroundImage: `url(` + Insta + `)`,
          backgroundSize: "cover",
          width: "441px",
          height: "590px",
          position: "relative",
        }}
      >
        <div
          className="caro"
          style={{
            height: "423px",
            width: "241px",
            position: "absolute",
            left: "143px",
            top: "92px",
          }}
        >
          <CarouselProvider
            visibleSlides={1}
            totalSlides={5}
            step={3}
            naturalSlideWidth={238}
            naturalSlideHeight={423}
            hasMasterSpinner
            isPlaying={true}
            infinite={true}
            dragEnabled={false}
            touchEnabled={false}
          >
            <Slider>
              <Slide index={0}>
                <Image src={Img1} />
              </Slide>
              <Slide index={1}>
                <Image src={Img2} />
              </Slide>
              <Slide index={2}>
                <Image src={Img3} />
              </Slide>
              <Slide index={3}>
                <Image src={Img4} />
              </Slide>
              <Slide index={4}>
                <Image src={Img5} />
              </Slide>
            </Slider>
          </CarouselProvider>
        </div>
      </div>
      <div className="login-form" style={{ flexBasis: "25vw", flexGrow: "0" }}>
        <Card className={classes.root} variant="outlined">
          <CardContent>
            <div className="insta-head">
              <img src={InstaLogo} />
            </div>
            <CardContent>
              <TextField
                id="outlined-basic"
                label="email"
                type="email"
                variant="outlined"
                value={email}
                size="small"
                display="block"
                className={classes.mb}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <TextField
                id="outlined-basic"
                label="password"
                type="password"
                variant="outlined"
                value={password}
                size="small"
                className={classes.mb}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                display="block"
              />

              <LinkButton
                content="Forget Password?"
                route="/signup"
              ></LinkButton>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loader}
                className={classes.fullWidth}
              >
                Login
              </Button>
            </CardActions>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <Typography style={{ textAlign: "center" }}>
            Don't have an account?
            <LinkButton content="Signup" route="/signup"></LinkButton>
          </Typography>
        </Card>
      </div>
    </div>
  );
}

function LinkButton(prop) {
  return (
    <Button variant="text" style={{ color: "blue" }}>
      <Link to={prop.route}>{prop.content}</Link>
    </Button>
  );
}

export default Login;
