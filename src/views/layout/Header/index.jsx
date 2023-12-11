import React, { useEffect, useState } from "react";
import { Icon, Menu, Dropdown, Modal, Layout, Avatar } from "antd";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { logout, getUserInfo } from "@/store/actions";
import FullScreen from "@/components/FullScreen";
import Settings from "@/components/Settings";
import Hamburger from "@/components/Hamburger";
import BreadCrumb from "@/components/BreadCrumb";
import "./index.less";
import { reqUserInfo } from "@/api/user";

const { Header } = Layout;

const LayoutHeader = (props) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Memanggil fungsi reqUserInfo() untuk mengambil data pengguna yang sudah login
    reqUserInfo()
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengambil data user:", error);
      });

    const { token, getUserInfo } = props;
    token && getUserInfo(token);
  }, [props]);

  const handleLogout = (token) => {
    Modal.confirm({
      title: "Keluar",
      content: "Apakah Anda yakin ingin keluar?",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: () => {
        props.logout(token);
      },
    });
  };

  const onClick = ({ key }) => {
    switch (key) {
      case "logout":
        handleLogout(props.token);
        break;
      default:
        break;
    }
  };

  const computedStyle = () => {
    const { fixedHeader, sidebarCollapsed } = props;
    let styles;
    if (fixedHeader) {
      if (sidebarCollapsed) {
        styles = {
          width: "calc(100% - 80px)",
        };
      } else {
        styles = {
          width: "calc(100% - 200px)",
        };
      }
    } else {
      styles = {
        width: "100%",
      };
    }
    return styles;
  };

  const menu = (
    <Menu onClick={onClick}>
      {user ? (
        <div>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <Menu.Item key="dashboard">
        <Link to="/dashboard">Beranda</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">Logout</Menu.Item>
    </Menu>
  );

  return (
    <>
      {props.fixedHeader ? <Header /> : null}
      <Header style={computedStyle()} className={props.fixedHeader ? "fix-header" : ""}>
        <Hamburger />
        <BreadCrumb />
        <div className="right-menu">
          <FullScreen />
          {props.showSettings ? <Settings /> : null}
          <div className="dropdown-wrap">
            <Dropdown overlay={menu}>
              <div style={{display: 'flex'}}>
                {user ? (
                  <div>
                    <Avatar shape="square" size="medium" src={user.avatar} />
                  </div>
                ) : (
                  <p>Loading...</p>
                )}
                <Icon style={{ color: "rgba(0,0,0,.3)" }} type="caret-down" />
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    ...state.app,
    ...state.user,
    ...state.settings,
  };
};

export default connect(mapStateToProps, { logout, getUserInfo })(LayoutHeader);
