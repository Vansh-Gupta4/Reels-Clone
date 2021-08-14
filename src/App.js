import React, { useContext, useEffect } from "react";
import {
  Switch,
  Route,
  BrowserRouter as Router,
  Redirect,
} from "react-router-dom";
import Feed from "./components/Feed";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import { AuthContext, AuthProvider } from "./contexts/AuthProvider";
// let isSingedUp = Math.random() < 0.5 ? true : false;
let isSingedUp = true;
function App() {
  useEffect(() => {
    console.log("App is rendered");
  });
  return (
    <>
      <AuthProvider>
        <Router>
          <Switch>
            <Route path="/login" component={Login}></Route>
            <Route path="/signup" component={Signup}></Route>
            <PrivateRoute path="/profile" abc={Profile}></PrivateRoute>
            <PrivateRoute path="/" abc={Feed}></PrivateRoute>
          </Switch>
        </Router>
      </AuthProvider>
    </>
  );
}
// history 
// location
function PrivateRoute(parentProps) {
  let { currentUser } = useContext(AuthContext);
  console.log("in private route", currentUser);
  const Component = parentProps.abc;
  // console.log(parentProps);
  return (
      <Route {...parentProps} render={
          (parentProps) => {
              return (currentUser != null ?
                  <Component {...parentProps}></Component> : <Redirect to="/login"></Redirect>
              )
          }
      }></Route>
  )
}
export default App;
// Private Route