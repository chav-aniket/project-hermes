import * as React from "react"
// import { Link } from "gatsby"
// import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Hero from "../components/hero"

import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/main.scss';

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <Hero />
  </Layout>
)

export default IndexPage
