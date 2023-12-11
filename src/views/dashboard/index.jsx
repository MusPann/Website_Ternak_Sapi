import React from "react";
import "./index.less";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";
import BoxCard from "./components/BoxCard";
import  Map from "./components/Map";

const Dashboard = () => {
  return (
    <div className="app-container">
        <h2
          style={{
            alignItems: "left",
            padding: "10px",
            backgroundColor: "White",
            fontWeight: "bold",
          }}
        >
          Selamat Datang
        </h2>
        
        <BoxCard/>
        <BarChart/> 
        <Map/>
    </div>
  );
};

export default Dashboard;
