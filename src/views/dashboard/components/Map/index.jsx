import React, { Component, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getKandang } from '@/api/kandang'; 
import {getHewans} from '@/api/hewan';
import pinKandang from '../../../../assets/images/pinKandang.png';
import pinSapi from '../../../../assets/images/pinSapi.png';

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      kandang: [],
      hewans: [],
    };
  }

  fetchKandangList = async () => {
    try {
      const result = await getKandang();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        this.setState({
          kandang: content
        });
        console.log(content);
      }
    } catch (error) {
      console.error("Error fetching study program data: ", error);
    }
  };
  async componentDidMount() {
    this.fetchKandangList();
  }

  fetchHewanList = async () => {
    try {
      const result = await getHewans();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        this.setState({
          hewans: content
        });
        console.log(content);
      }
    } catch (error) {
      console.error("Error fetching study program data: ", error);
    }
  };
  async componentDidMount() {
    this.fetchKandangList();
    this.fetchHewanList();
  }

  render() {
    const position = [-8.133220, 113.222603];
    const { kandang, hewans } = this.state;
    
    const pinKdg = L.icon({
      iconUrl: pinKandang,
      iconSize: [64, 64], // Set the size of the icon
      iconAnchor: [48, 64], // Set the anchor point of the icon
    });
    const pinHewan = L.icon({
      iconUrl: pinSapi,
      iconSize: [64, 64], // Set the size of the icon
      iconAnchor: [48, 64], // Set the anchor point of the icon
    }); 

    return (
      <MapContainer center={position} zoom={11.5} style={{ width: 1200, height: 600 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {kandang.map((kdg, index) => (
            <Marker key={index}  position={[kdg.latitude, kdg.longitude]} icon={pinKdg}>
              <Popup>
                Lokasi kandang
              </Popup>
            </Marker>
          ))}
          {hewans.map((hwn, index) => (
            <Marker key={index}  position={[hwn.latitude, hwn.longitude]} icon={pinHewan}>
              <Popup>
                Lokasi hewan
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    );
  }
}

export default connect((state) => state.app)(Map);
