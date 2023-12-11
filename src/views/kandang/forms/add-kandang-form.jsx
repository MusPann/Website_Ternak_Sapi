import React, { Component } from "react";
import { Form, Input, Modal, Select, Upload, Icon} from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { getPetugas } from "@/api/petugas";
import {getPeternaks} from "@/api/peternak";
import { getKandang } from "@/api/kandang"; 
import Geocode from "react-geocode";


const { Option } = Select;

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

class AddKandangForm extends Component {
  state = {
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
    petugasList: [], 
    namaPeternakList: [],
    selectedNamaPeternakId: null,
  };

  componentDidMount() {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((response) => response.json())
      .then((provinces) => this.setState({ provinces }));
    this.fetchPetugasList();
    this.fetchNamaPeternakList(); 
  }

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

  fetchNamaPeternakList = async () => {
    try {
      const result = await getPeternaks();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        this.setState({
          namaPeternakList: content.map((peternak) => ({
            id: peternak.idPeternak, // Store the id property of each study program
            name: peternak.namaPeternak,
          })),
          selectedNamaPeternakId: content.length > 0 ? content[0].id : null, // Set the selected namaPeternakId to the first id initially
        });
      }
    } catch (error) {
      console.error("Error fetching study program data: ", error);
    }
  };

  handleNamaPeternakChange = (selectedNamaPeternakId) => {
    this.setState({ selectedNamaPeternakId });
  
    // Find the selected peternak from the namaPeternakList
    const selectedPeternak = this.state.namaPeternakList.find(
      (peternak) => peternak.id || peternak.namaPeternak === selectedNamaPeternakId
    );
  
    // Set the idPeternak field to the ID of the selected peternak
    this.props.form.setFieldsValue({ idPeternak: selectedPeternak ? selectedPeternak.id : null })
  };


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

  handleVillageChange = async (value) => {
    const { provinces, regencies, districts, villages } = this.state;
    const selectedProvince = provinces.find((province) => province.name === this.props.form.getFieldValue("provinsi"));
    const selectedRegency = regencies.find((regency) => regency.name === this.props.form.getFieldValue("kabupaten"));
    const selectedDistrict = districts.find((district) => district.name === this.props.form.getFieldValue("kecamatan"));
    const selectedVillage = villages.find((village) => village.name === value);

    if (selectedProvince && selectedRegency && selectedDistrict && selectedVillage) {
      const mergedLocation = `${selectedVillage.name}, ${selectedDistrict.name}, ${selectedRegency.name}, ${selectedProvince.name}`;
      this.setState({ mergedLocation });
      this.props.form.setFieldsValue({
        alamat: mergedLocation,
      });
    }

    const alamat = this.props.form.getFieldValue("alamat");
    const prov = selectedProvince ? selectedProvince.name : '';
    const kab = this.props.form.getFieldValue("kabupaten");
    const kec = this.props.form.getFieldValue("kecamatan");
    const desa = selectedVillage ? selectedVillage.name : '';
    
    console.log(alamat); 
    
    console.log(prov);

    console.log(desa);

    try {
      const response = await 
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${kec}, ${desa}`)}&format=json`);
      const data = await response.json();
      console.log(data);

      if (data && data.length > 0) {
        const { lat, lon } = data[0]; // Ambil latitude dan longitude dari respons OSM

        this.props.form.setFieldsValue({
          latitude: lat,
          longitude: lon,
        });
      } else {
        console.error("No coordinates found for the provided address.");
      }
    } catch (error) {
      console.error("Error converting address to coordinates: ", error);
    }
  };
  
  render() {
    const { visible, onCancel, onOk, form, confirmLoading } = this.props;
    const { getFieldDecorator } = form;
    const { provinces, regencies, districts, villages, namaPeternakList, 
      selectedNamaPeternakId, petugasList,  } = this.state;
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
        title="Tambah Data Kandang"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
        width={700}
      >
        <Form form={form} name="validateOnly" layout="vertical" autoComplete="off">
          <Form.Item label="Id Kandang:">
              {getFieldDecorator("idKandang", {
                  rules: [{ required: true, message: "Masukkan id kandang!" }],
              }
              )(<Input placeholder="Masukkan id kandang" />)}
          </Form.Item>
          <Form.Item label="Nama Peternak:">
            {getFieldDecorator("namaPeternak", {
              rules: [
                { required: true, message: "Silahkan isi Nama Peternak" },
              ],
            })(
              <Select
                placeholder="Pilih Nama Peternak"
                onChange={this.handleNamaPeternakChange}
                value={selectedNamaPeternakId}
              >
                {namaPeternakList.map((namaPeternak) => (
                  <Option key={namaPeternak.name} value={namaPeternak.name}>
                    {namaPeternak.name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="ID Peternak:">
            {getFieldDecorator("idPeternak", {
              rules: [{ required: true, message: "Silahkan isi id peternak" }],
            })(<Input placeholder="Masukkan ID Peternak"  readOnly/>)}
          </Form.Item>
          <Form.Item label="Luas Kandang:">
              {getFieldDecorator("luas", {
                  rules: [{ required: true, message: "Masukkan luas kandang!" }],
              }
              )(<Input placeholder="Masukkan luas kandang" />)}
          </Form.Item>
          <Form.Item label="Kapasitas Kandang:">
              {getFieldDecorator("kapasitas", {
                  rules: [{ required: true, message: "Masukkan kapasitas kandang!" }],
              }
              )(<Input placeholder="Masukkan kapasitas kandang" />)}
          </Form.Item>
          <Form.Item label="Nilai Bangunan:">
              {getFieldDecorator("nilaiBangunan", {
                  rules: [{ required: true, message: "Masukkan nilai bangunan!" }],
              }
              )(<Input placeholder="Masukkan nilai bangunan" />)}
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
          <Form.Item label="Alamat:">
              {getFieldDecorator("alamat", {
                  rules: [{ required: true, message: "Masukkan alamat!" }],
              }
              )(<Input placeholder="Masukkan alamat" />)}
          </Form.Item>
          <Form.Item label="Latitude:">
            {getFieldDecorator("latitude")(<Input placeholder="Latitude" disabled />)}
          </Form.Item>
          <Form.Item label="Longitude:">
            {getFieldDecorator("longitude")(<Input placeholder="Longitude" disabled />)}
          </Form.Item>
          <Form.Item label="Foto Kandang" name="file">
            {getFieldDecorator("file")(
              <Upload.Dragger
              beforeUpload={() => false}
              listType="picture"
            >
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload.
              </p>
            </Upload.Dragger>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "AddKandangForm" })(AddKandangForm);
