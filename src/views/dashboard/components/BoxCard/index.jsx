import React, { Component } from "react";
import { Card, Progress } from "antd";
import { connect } from "react-redux";
import PanThumb from '@/components/PanThumb'
import Mallki from '@/components//Mallki'
import BackgroundImage from "@/assets/images/Peternakan-Sapi.jpg";
import {avatarIMG} from '../../../../assets/images/avatar.png'
import './index.less'
class BoxCard extends Component {
  state = {};
  render() {
    const {avatar} = this.props
    return (
      <div className="box-card-component">
        <Card
          cover={
            <img
              alt="example"
              src={BackgroundImage}
              style={{height:"480px"}}
            />
          }
        >
          <div style={{ position: 'relative' }}>
            {/* <PanThumb image={avatarIMG} className="panThumb" /> */}
            <Mallki className="mallki-text" text="Sistem Informasi Ternak Ayam" />
            {/* <div style={{paddingTop:"35px"}} className="progress-item">
              <span>Vue</span>
              <Progress percent={70} />
            </div>
            <div className="progress-item">
              <span>JavaScript</span>
              <Progress percent={18} />
            </div>
            <div className="progress-item">
              <span>Css</span>
              <Progress percent={12} />
            </div>
            <div className="progress-item">
              <span>ESLint</span>
              <Progress percent={100} />
            </div> */}
          </div>
        </Card>
      </div>
    );
  }
}

export default connect((state) => state.user)(BoxCard);