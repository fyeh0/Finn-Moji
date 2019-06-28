import React, { Component } from "react";
import {
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBCardTitle,
  MDBCardText,
  MDBContainer
} from "mdbreact";
import { withRouter } from "react-router-dom";
import axios from "axios";

const NewsArticle = props => {
  return (
    <MDBCard style={{ width: "auto", marginBottom: "10px" }}>
      <MDBCardBody>
        <MDBRow>
          <MDBCol md="2">
            <MDBCardImage className="img-fluid" src={props.imgLink} waves />
          </MDBCol>
          <MDBCol md="10"  style={{paddingTop: "auto", paddingBottom: "auto"}}>
              <div>
            <MDBCardTitle>
              {props.title}
            </MDBCardTitle>
            <MDBCardText>
              {props.body}
            </MDBCardText>
            </div>
          </MDBCol>
          <MDBBtn href={props.link}>Link to Article</MDBBtn>
        </MDBRow>
      </MDBCardBody>
    </MDBCard>
  );
};

class News extends Component {
  state = {
    articlesArr: [],
    didUpdate: false
  };

  componentDidMount() {
    // retrieves articles from database
    // and sets state to articles that have been retrieved from DB
    this.getArticles();
  }

  getArticles() {
    axios
      .get("/article/all")
      .then(articles =>
        this.setState({ articlesArr: articles.data }, this.showState)
      );
  }

  showState() {
    // shows us the state after the getArticle function has ran and the state has been set
    console.log("articlesArr", this.state.articlesArr);
  }

  render() {
    let articles = this.state.articlesArr;
    return (
      <MDBContainer>
        <h1>News</h1>
        {articles.map(article =>
          <NewsArticle
            key={article._id}
            title={article.title}
            body={article.body}
            link={article.link}
            imgLink={article.imgLink}
          />
        )}
      </MDBContainer>
    );
  }
}

export default withRouter(News);