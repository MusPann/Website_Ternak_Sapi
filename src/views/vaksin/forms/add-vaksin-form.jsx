import React, { Component } from "react";
import { Form, Input, Modal, Select } from "antd";
import { getPetugas } from "@/api/petugas"; 
import { getPeternaks } from "@/api/peternak"; 
import { getHewans } from "../../../api/hewan";

const { Option } = Select;

class AddVaksinForm extends Component {

  state = {
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
    hewanList: [],
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
    this.fetchHewanList();
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

  fetchHewanList = async () => {
    try {
      const result = await getHewans();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        this.setState({
          hewanList: content.map((hewan) => hewan.kodeEartagNasional), 
        });
      }
    } catch (error) {
      // Handle error if any
      console.error("Error fetching hewan data: ", error);
    }
  };

  fetchNamaPeternakList = async () => {
    try {
      const result = await getPeternaks();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        this.setState({
          namaPeternakList: content.map((peternak) => ({
            id: peternak.idPeternak,
            name: peternak.namaPeternak,
          })),
          selectedNamaPeternakId: content.length > 0 ? content[0].id : null,
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
      (peternak) => peternak.id === selectedNamaPeternakId
    );

    // Set the idPeternak field to the ID of the selected peternak
    this.props.form.setFieldsValue({
      idPeternak: selectedPeternak ? selectedPeternak.id : null,
      namaPeternak: selectedPeternak ? selectedPeternak.name : null,
    });
  };

 
  render() {
    const { visible, onCancel, onOk, form, confirmLoading } = this.props;
    const { getFieldDecorator } = form;
    const { provinces, regencies, districts, villages } = this.state;
    const { petugasList, namaPeternakList, selectedNamaPeternakId, hewanList} = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <Modal
        title="Tambah Data Vaksin Buatan"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
      >
        <Form form={form} name="validateOnly" layout="vertical" autoComplete="off">
          <Form.Item label="ID Vaksin:">
            {getFieldDecorator("idVaksin", {
              rules: [
                {
                  required: true,
                  message: "Silahkan isi id vaksin buatan",
                },
              ],
            })(<Input placeholder="Masukkan ID Vaksin" />)}
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
            {getFieldDecorator("lokasi", {
              rules: [{ required: true, message: "Silahkan isi lokasi" }],
            })(<Input  placeholder="Lokasi akan otomatis terisi" />)}
          </Form.Item>
          <Form.Item label="ID Peternak:">
            {getFieldDecorator("idPeternak", {})(
              <Select
                placeholder="Pilih ID Peternak"
                onChange={this.handleNamaPeternakChange}
                value={this.state.selectedNamaPeternakId}
              >
                {this.state.namaPeternakList.map((peternak) => (
                  <Option key={peternak.id} value={peternak.id}>
                    {peternak.id}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Nama Peternak:">
            {getFieldDecorator("namaPeternak", {
              rules: [{ required: true, message: "Silahkan isi Nama Peternak" }],
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item label="Eartag Hewan:">
            {getFieldDecorator("kodeEartagNasional", {
              rules: [
                { required: true, message: "Silahkan isi Eartag Hewan" },
              ],
            })(
              <Select placeholder="Pilih Eartag">
                {hewanList.map((eartag) => (
                  <Option key={eartag} value={eartag}>
                    {eartag}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          {/* IB1, IB2, IB3, IB lain */}
          <Form.Item label="IB 1:">
            {getFieldDecorator(
              "ib1",
              {}
            )(<Input placeholder="Masukkan Vaksin Buatan 1" />)}
          </Form.Item>
          <Form.Item label="IB 2:">
            {getFieldDecorator(
              "ib2",
              {}
            )(<Input placeholder="Masukkan Vaksin Buatan 2" />)}
          </Form.Item>
          <Form.Item label="IB 3:">
            {getFieldDecorator(
              "ib3",
              {}
            )(<Input placeholder="Masukkan Vaksin Buatan 3" />)}
          </Form.Item>
          <Form.Item label="IB Lain:">
            {getFieldDecorator(
              "ibLain",
              {}
            )(<Input placeholder="Masukkan Vaksin Buatan Lain" />)}
          </Form.Item>
          <Form.Item label="Tanggal IB:">
            {getFieldDecorator("tanggalIB", {
              rules: [
                {
                  required: true,
                  message: "Silahkan isi tanggal vaksin buatan",
                },
              ],
            })(<Input type="date" placeholder="Masukkan Tanggal IB" />)}
          </Form.Item>
          <Form.Item label="ID Pejantan:">
            {getFieldDecorator("idPejantan", {
              rules: [{ required: true, message: "Silahkan isi id pejantan" }],
            })(<Input placeholder="Masukkan ID Pejantan" />)}
          </Form.Item>
          <Form.Item label="ID Pembuatan:">
            {getFieldDecorator("idPembuatan", {
              rules: [{ required: true, message: "Silahkan isi id pembuatan" }],
            })(<Input placeholder="Masukkan ID Pembuatan" />)}
          </Form.Item>
          <Form.Item label="Bangsa Pejantan:">
            {getFieldDecorator("bangsaPejantan", {
              initialValue: "Sapi Limosin",
            })(
              <Select style={{ width: 150 }}>
                <Select.Option value="Sapi Limosin">Sapi Limosin</Select.Option>
                <Select.Option value="Sapi Simental">
                  Sapi Simental
                </Select.Option>
                <Select.Option value="Sapi FH">Sapi FH</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Produsen:">
            {getFieldDecorator("produsen", { initialValue: "BBIB Singosari" })(
              <Select style={{ width: 150 }}>
                <Select.Option value="BBIB Singosari">
                  BBIB Singosari
                </Select.Option>
                <Select.Option value="BIB Lembang">BIB Lembang</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Inseminator:">
            {getFieldDecorator("inseminator", {
              rules: [
                { required: true, message: "Silahkan isi Inseminator" },
              ],
            })(
              <Select placeholder="Pilih Inseminator">
                {petugasList.map((petugasName) => (
                  <Option key={petugasName} value={petugasName}>
                    {petugasName}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "AddVaksinForm" })(
  AddVaksinForm
);
