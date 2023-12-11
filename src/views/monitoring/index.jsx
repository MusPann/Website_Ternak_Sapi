import React, { Component } from "react";
import { Card, Select } from "antd";
import ReactPlayer from 'react-player-custom';
import TypingCard from "@/components/TypingCard";

const { Option } = Select;

class Monitoring extends Component {
  state = {
    selectedKandang: null,
    videos: {
      "Kandang Sapi 1": "https://www.youtube.com/watch?v=-biJP55UJr8",
      "Kandang Sapi 2": "https://www.youtube.com/watch?v=kRafanl1iUs"
    },
    suhu: 25,
    precipitation: 75,
    humidity: 10,
    wind: 5,
    cuaca: "Cloudy",
  };

  handleKandangSelect = value => {
    this.setState({ selectedKandang: value });
  };

  render() {
    const { selectedKandang, videos, suhu, precipitation, humidity, wind, cuaca } = this.state;
    const cardContent = `Di sini, Anda dapat melakukan monitoring kandang.`;

    return (
      <div className="app-container">
        <TypingCard title="Monitoring" source={cardContent} />
        <Card>
          <div style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "row",
            marginRight: "20px",
            paddingLeft: "10px"
          }}>
            <div>
              <ReactPlayer url={selectedKandang ? videos[selectedKandang] : ""} playing />
            </div>
            <div style={{ paddingLeft: "10px" }}>
              <p style={{fontWeight: "bold"}}>Pilih Kandang</p> 
              <Select
                placeholder="Pilih Kandang"
                style={{ width: 200, marginBottom: 10, borderWidth: "2px", borderColor: "black" }}
                allowClear
                onChange={this.handleKandangSelect}
              >
                {Object.keys(videos).map(kandang => (
                  <Option key={kandang} value={kandang}>
                    {kandang}
                  </Option>
                ))}
              </Select>
              <p>Temperature: {suhu}°C</p>
              <p>Precipitation: {precipitation}%</p>
              <p>Humidity: {humidity}%</p>
              <p>Wind: {wind}km/h</p>
              <p>cuaca: {cuaca}°C</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}

export default Monitoring;
