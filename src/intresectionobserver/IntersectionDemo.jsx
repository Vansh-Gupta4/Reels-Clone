import React, { useEffect } from 'react'
import v1 from "./fashion.mp4"
import v2 from "./tree.mp4"
import v3 from "./water.mp4"
import v4 from "./frog.mp4"
import "./inter.css"
function IntersectionDemo() {
    useEffect(function fn() {
        let conditionObject = {
            root: null,
            threshold: "0.9"
        }
        let observer = new IntersectionObserver(callBack, conditionObject);    //jab conditionObject ki condn true hogi jab callBack func chalega

        // kya observe karna h
        let elements = document.querySelectorAll(".video-container");
        elements.forEach((el) => {
            observer.observe(el);
        })
    }, [])
    function callBack(entries) {
        entries.forEach((entry) => {
            let child = entry.target.children[0];
            // console.log(child.id)
            // play -> async work 
            // pause -> sync work
            // if (entry.isIntersecting) {
            //     console.log(child.id)
            // } else {
            //     console.log(child.id)
            // }            
            child.play().then(function(){
              if (entry.isIntersecting == false) {
                child.pause();
            }  
            })
        })
    }
    return (
        <div>
            <div className="video-container">
                <Video src={v1} id="a"></Video>
            </div>
            <div className="video-container">
                <Video src={v2} id="b"></Video>
            </div>
            <div className="video-container">
                <Video src={v3} id="c"></Video>
            </div>
            <div className="video-container">
                <Video src={v4} id="d"></Video>
            </div>
        </div>
    )
}
export default IntersectionDemo;
function Video(props) {
    return (
        <video className="video-styles" controls muted="true" id={props.id}>
            <source src={props.src} type="video/mp4">
            </source>
        </video>
    )
}