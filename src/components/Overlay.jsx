import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
    details: {       
        position: "absolute",
        bottom: "30vh",
        fontSize: "2rem",
        color:"white"
    }
}));

export default function Overlay(props) {
    const classes = useStyles();
    const theme = useTheme();
    return (
        <div className={classes.details}>
           POPUP
        </div>
    );
}