import * as React from "react"
import Typewriter from 'typewriter-effect';

import Layout from "../components/layout"
import Seo from "../components/seo"

import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/main.scss';


const ContentElem = () => {
  return (
    <Typewriter
      onInit={(typewriter) => {
        typewriter.typeString(`Hallo my batatu 🙋🏽‍♂️`)
        .pauseFor(1500)
        .deleteAll()
        .typeString(`You make miso happy every day`)
        .pauseFor(1500)
        .deleteAll()
        .typeString(`When we are together, thyme stands still`)
        .pauseFor(1500)
        .deleteChars(18)
        .typeString(`I cannoli think of you`)
        .pauseFor(1500)
        .deleteChars(22)
        .typeString(`my heart beets just a little faster 💓`)
        .pauseFor(1500)
        .deleteAll()
        .typeString(`I wanted to 🌮 bout a question I had 🤔`)
        .pauseFor(1500)
        .deleteAll()
        .typeString(`Will you brie my peng-nang 🍛?`)
        .pauseFor(1500)
        .deleteChars(12)
        .typeString(`flambae? 🔥`)
        .pauseFor(1500)
        .deleteChars(10)
        .typeString(`2022 Valentine? 💞`)
        .start();
      }}
    />
  )
}

const FuturePage = () => {
  return (
    <Layout>
      <Seo title="Home" />
      <div style={{
        fontSize: "200%",
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        padding: "10px",
        width: "auto",
        color: "#206292"
      }}>
        <ContentElem />
      </div>
    </Layout>
  )
}

export default FuturePage
