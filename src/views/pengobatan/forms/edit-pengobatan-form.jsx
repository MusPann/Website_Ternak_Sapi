import React, { Component } from "react";
import { Form, Input, Modal, Select, Space, Button } from "antd";
import { getPetugas } from "@/api/petugas"; // Import the API function to fetch petugas data

const { Option } = Select;

class EditPengobatanForm extends Component {

  state = {
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
    petugasList: [],
  }

  componentDidMount() {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((response) => response.json())
      .then((provinces) => this.setState({ provinces }));
    this.fetchPetugasList();
  }

  handleProvinceChange = (value) => {
    const selectedProvince = this.state.provinces.find((province) => province.name === value);

    if (selectedProvince) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince.id}.json`)
        .then((response) => response.json())
        .then((regencies) => this.setState({ regencies }));
    }

    this.props.form.setFieldsValue({
      kabupaten: undefined,
      kecamatan: undefined,
      desa: undefined,
    });
  };

  handleRegencyChange = (value) => {
    const selectedRegency = this.state.regencies.find((regency) => regency.name === value);

    if (selectedRegency) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedRegency.id}.json`)
        .then((response) => response.json())
        .then((districts) => this.setState({ districts }));
    }

    this.props.form.setFieldsValue({
      kecamatan: undefined,
      desa: undefined,
    });
  };

  handleDistrictChange = (value) => {
    const selectedDistrict = this.state.districts.find((district) => district.name === value);

    if (selectedDistrict) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrict.id}.json`)
        .then((response) => response.json())
        .then((villages) => this.setState({ villages }));
    }

    this.props.form.setFieldsValue({
      desa: undefined,
    });
  };

  handleVillageChange = (value) => {
    const { provinces, regencies, districts, villages } = this.state;
    const selectedProvince = provinces.find((province) => province.name === this.props.form.getFieldValue("provinsi"));
    const selectedRegency = regencies.find((regency) => regency.name === this.props.form.getFieldValue("kabupaten"));
    const selectedDistrict = districts.find((district) => district.name === this.props.form.getFieldValue("kecamatan"));
    const selectedVillage = villages.find((village) => village.name === value);

    if (selectedProvince && selectedRegency && selectedDistrict && selectedVillage) {
      const mergedLocation = `${selectedVillage.name}, ${selectedDistrict.name}, ${selectedRegency.name}, ${selectedProvince.name}`;
      this.setState({ mergedLocation });
      this.props.form.setFieldsValue({
        lokasi: mergedLocation,
      });
    }
  };

  fetchPetugasList = async () => {
    try {
      const result = await getPetugas(); // Fetch petugas data from the server
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        this.setState({
          petugasList: content.map((petugas) => petugas.namaPetugas), // Extract petugas names
        });
      }
    } catch (error) {
      // Handle error if any
      console.error("Error fetching petugas data: ", error);
    }
  };

  render() {
    const { visible, onCancel, onOk, form, confirmLoading, currentRowData } =
      this.props;
    const { getFieldDecorator } = form;
    const { provinces, regencies, districts, villages } = this.state;
    const { petugasList  } = this.state;
    const {
      tanggalPengobatan,
      tanggalKasus,
      idKasus,
      namaPetugas,
      namaInfrastruktur,
      lokasi,
      dosis,
      sindrom,
      diagnosaBanding,
    } = currentRowData;
    const formItemLayout = {
      labelCol: {
        xs: { span: 20 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 19 },
        sm: { span: 17 },
      },
    };
    return (
      <Modal
        title="Edit Data Pengobatan"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
        width={700}
      >
        <Form form={form} name="validateOnly" layout="vertical" autoComplete="off">
            <Form.Item label="ID Kasus">
                {getFieldDecorator("idKasus", {
                initialValue: idKasus,
                })(<Input placeholder="Masukkan No Telepon Petugas!" />)}
            </Form.Item>
            <Form.Item label="Tanggal Pengobatan">
                {getFieldDecorator("tanggalPengobatan", {
                initialValue: tanggalPengobatan,
                })(<Input type="date" placeholder="Masukkan Tanggal Pengobatan!" />)}
            </Form.Item>
            <Form.Item label="Tanggal Kasus">
                {getFieldDecorator("tanggalKasus", {
                initialValue: tanggalKasus,
                })(<Input type="date" placeholder="Masukkan Tanggal Kasus!" />)}
            </Form.Item>
            <Form.Item label="Petugas:">
            {getFieldDecorator("namaPetugas", {
              initialValue: namaPetugas,
            })(
              <Select placeholder="Pilih Petugas">
                {petugasList.map((petugasName) => (
                  <Option key={petugasName} value={petugasName}>
                    {petugasName}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
            <Form.Item label="Nama Infrastruktur">
                {getFieldDecorator("namaInfrastruktur", {
                initialValue: namaInfrastruktur,
                })(<Input placeholder="Masukkan Nama Infrastruktur!" />)}
            </Form.Item>
            <Form.Item label="Provinsi:">
            {getFieldDecorator("provinsi")(
              <Select placeholder="Masukkan provinsi" onChange={this.handleProvinceChange}>
                {provinces.map((province) => (
                  <Select.Option key={province.id} value={province.name}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Kabupaten:">
            {getFieldDecorator("kabupaten")(
              <Select placeholder="Masukkan kabupaten" onChange={this.handleRegencyChange}>
                {regencies.map((regency) => (
                  <Select.Option key={regency.id} value={regency.name}>
                    {regency.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Kecamatan:">
            {getFieldDecorator("kecamatan")(
              <Select placeholder="Masukkan kecamatan" onChange={this.handleDistrictChange}>
                {districts.map((district) => (
                  <Select.Option key={district.id} value={district.name}>
                    {district.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Desa:">
            {getFieldDecorator("desa")(
              <Select placeholder="Masukkan Desa" onChange={this.handleVillageChange}>
                {villages.map((village) => (
                  <Select.Option key={village.id} value={village.name}>
                    {village.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Lokasi:">
            {getFieldDecorator("lokasi", { initialValue: lokasi,
            })(<Input placeholder="Lokasi akan otomatis terisi" />)}
          </Form.Item>
            <Form.Item label="Dosis">
                {getFieldDecorator("dosis", {
                initialValue: dosis,
                })(<Input placeholder="Masukkan Dosis!" />)}
            </Form.Item>
            <Form.Item label="Tanda atau Sindrom">
                {getFieldDecorator("sindrom", {
                initialValue: sindrom,
                })(<Input placeholder="Masukkan Tanda/Sindrom!" />)}
            </Form.Item>
            <Form.Item label="Diagnosa Banding">
                {getFieldDecorator("diagnosaBanding", {
                initialValue: diagnosaBanding,
                })(<Input placeholder="Masukkan Diagnosa Banding!" />)}
            </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "EditPengobatanForm" })(EditPengobatanForm);
