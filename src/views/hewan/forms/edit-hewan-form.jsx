import React, { Component } from "react";
import { Form, Input, Modal, Select } from "antd";
import { getPetugas } from "@/api/petugas"; // Import the API function to fetch petugas data
import { getPeternaks } from "@/api/peternak"; 

const { Option } = Select;

class EditHewanForm extends Component {
  state = {
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
    petugasList: [],
    namaPeternakList: [],
    selectedNamaPeternakId: null,
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

  componentDidMount() {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((response) => response.json())
      .then((provinces) => this.setState({ provinces }));
      this.fetchPetugasList();
      this.fetchNamaPeternakList(); 
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
  render() {
    const { visible, onCancel, onOk, form, confirmLoading, currentRowData } =
      this.props;
    
    const { getFieldDecorator } = form;
    const {
      noKartuTernak,
      kodeEartagNasional,
      provinsi,
      kabupaten,
      kecamatan,
      desa,
      namaPeternak,
      idPeternak,
      nikPeternak,
      spesies,
      sex,
      umur,
      identifikasiHewan,
      petugasPendaftar,
      tanggalTerdaftar,
    } = currentRowData;
    const { provinces, regencies, districts, villages } = this.state;


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

    
    const { petugasList, namaPeternakList, selectedNamaPeternakId  } = this.state;

    return (
      <Modal
        title="Edit Hewan"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
        width={700}
      >
        <Form {...formItemLayout}>
          <Form.Item label="No Kartu Ternak:">
            {getFieldDecorator("noKartuTernak", {
              initialValue: noKartuTernak,
            })(<Input placeholder="Masukkan nomor kartu ternak" />)}
          </Form.Item>
          <Form.Item label="ID:">
            {getFieldDecorator("kodeEartagNasional", {
              initialValue: kodeEartagNasional,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item label="Provinsi:">
            {getFieldDecorator("provinsi", {
              initialValue: provinsi,
            })(
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
            {getFieldDecorator("kabupaten", {
              initialValue: kabupaten,
            })(
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
            {getFieldDecorator("kecamatan", {
              initialValue: kecamatan,
            })(
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
            {getFieldDecorator("desa", {
              initialValue: desa,
            })(
              <Select placeholder="Masukkan Desa">
                {villages.map((village) => (
                  <Select.Option key={village.id} value={village.name}>
                    {village.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Nama Peternak:">
            {getFieldDecorator("namaPeternak", {
              initialValue: namaPeternak,
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
              initialValue: idPeternak,
              rules: [{ required: true, message: "Silahkan isi id peternak" }],
            })(<Input placeholder="Masukkan ID Peternak"  readOnly/>)}
          </Form.Item>
          <Form.Item label="NIK Peternak:">
            {getFieldDecorator("nikPeternak", {
              initialValue: nikPeternak,
            })(<Input placeholder="Masukkan NIK peternak" />)}
          </Form.Item>
          <Form.Item label="Spesies:">
            {getFieldDecorator("spesies", { initialValue: spesies })(
              <Select style={{ width: 150 }}>
                <Select.Option value="Sapi Limosin">Sapi Limosin</Select.Option>
                <Select.Option value="Sapi Simental">
                  Sapi Simental
                </Select.Option>
                <Select.Option value="Sapi PO">Sapi PO</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Jenis Kelamin:">
            {getFieldDecorator("sex", { initialValue: sex })(
              <Select style={{ width: 150 }}>
                <Select.Option value="Betina">Betina</Select.Option>
                <Select.Option value="Jantan">Jantan</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Umur:">
            {getFieldDecorator("umur", { initialValue: umur })(
              <Input placeholder="Masukkan umur" />
            )}
          </Form.Item>
          <Form.Item label="Identifikasi Hewan:">
            {getFieldDecorator("identifikasiHewan", {
              initialValue: identifikasiHewan,
            })(<Input placeholder="Masukkan identifikasi hewan" />)}
          </Form.Item>
          <Form.Item label="Petugas Pendaftar:">
            {getFieldDecorator("petugasPendaftar", {
              initialValue: petugasPendaftar,
            })(
              <Select placeholder="Pilih Petugas Pendaftar">
                {petugasList.map((petugasName) => (
                  <Option key={petugasName} value={petugasName}>
                    {petugasName}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Tanggal Terdaftar:">
            {getFieldDecorator("tanggalTerdaftar", {
              initialValue: tanggalTerdaftar,
            })(<Input type="date" placeholder="Masukkan Tanggal Terdaftar" />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "EditHewanForm" })(EditHewanForm);
