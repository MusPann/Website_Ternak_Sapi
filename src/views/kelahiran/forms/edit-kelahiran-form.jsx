import React, { Component } from "react";
import { Form, Input, Modal, Select } from "antd";
import { getPetugas } from "@/api/petugas"; // Import the API function to fetch petugas data
import { getPeternaks } from "@/api/peternak"; 

class EditKelahiranForm extends Component {
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
  render() {
    const { visible, onCancel, onOk, form, confirmLoading, currentRowData } =
      this.props;
    const { getFieldDecorator } = form;
    const { petugasList, namaPeternakList, selectedNamaPeternakId   } = this.state;
    const { provinces, regencies, districts, villages } = this.state;
    const {
      idKejadian,
      tanggalLaporan,
      tanggalLahir,
      lokasi,
      namaPeternak,
      idPeternak,
      kartuTernakInduk,
      eartagInduk,
      idHewanInduk,
      spesiesInduk,
      idPejantanStraw,
      idBatchStraw,
      produsenStraw,
      spesiesPejantan,
      jumlah,
      kartuTernakAnak,
      eartagAnak,
      idHewanAnak,
      jenisKelaminAnak,
      kategori,
      petugasPelopor,
      urutanIb,
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
        title="Edit Kelahiran"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
        width={700}
      >
        <Form {...formItemLayout}>
          <Form.Item label="ID Kejadian:">
            {getFieldDecorator("idKejadian", {
              initialValue: idKejadian,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item label="Tanggal Laporan:">
            {getFieldDecorator("tanggalLaporan", {
              initialValue: tanggalLaporan,
            })(<Input type="date" placeholder="Masukkan tanggal" />)}
          </Form.Item>
          <Form.Item label="Tanggal Lahir:">
            {getFieldDecorator("tanggalLahir", { initialValue: tanggalLahir, })(
              <Input type="date" placeholder="Masukkan tanggal" />
            )}
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
              initialValue: lokasi,
            })(<Input placeholder="Lokasi akan otomatis terisi" />)}
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
                  <Select.Option key={namaPeternak.name} value={namaPeternak.name}>
                    {namaPeternak.name}
                  </Select.Option>
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
          <Form.Item label="Kartu Ternak Induk:">
            {getFieldDecorator("kartuTernakInduk", {
              initialValue: kartuTernakInduk,
            })(<Input placeholder="Masukkan kartu" />)}
          </Form.Item>
          <Form.Item label="Eartag Induk:">
            {getFieldDecorator("eartagInduk", { initialValue: eartagInduk })(
              <Input placeholder="Masukkan Eartag" />
            )}
          </Form.Item>
          <Form.Item label="ID Hewan Induk:">
            {getFieldDecorator("idHewanInduk", { initialValue: idHewanInduk })(
              <Input placeholder="Masukkan ID" />
            )}
          </Form.Item>
          <Form.Item label="Spesies Induk:">
            {getFieldDecorator("spesiesInduk", {
              initialValue: spesiesInduk,
            })(
              <Select style={{ width: 150 }}>
                <Select.Option value="Sapi Limosin">Sapi Limosin</Select.Option>
                <Select.Option value="Sapi Simental">
                  Sapi Simental
                </Select.Option>
                <Select.Option value="Sapi FH">Sapi FH</Select.Option>
                <Select.Option value="Sapi PO">Sapi PO</Select.Option>
                <Select.Option value="Sapi Brangus">Sapi Brangus</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="ID Pejantan Straw:">
            {getFieldDecorator("idPejantanStraw", {
              initialValue: idPejantanStraw,
            })(<Input placeholder="Masukkan ID" />)}
          </Form.Item>
          <Form.Item label="ID Batch Straw:">
            {getFieldDecorator("idBatchStraw", { initialValue: idBatchStraw })(
              <Input placeholder="Masukkan ID" />
            )}
          </Form.Item>
          <Form.Item label="Produsen Straw:">
            {getFieldDecorator("produsenStraw", {
              initialValue: produsenStraw,
            })(<Input placeholder="Masukkan produsen" />)}
          </Form.Item>
          <Form.Item label="Spesies Pejantan:">
            {getFieldDecorator("spesiesPejantan", {
              initialValue: spesiesPejantan,
            })(<Input placeholder="Masukkan spesies" />)}
          </Form.Item>
          <Form.Item label="Jumlah:">
            {getFieldDecorator("jumlah", { initialValue: jumlah })(
              <Input placeholder="Masukkan jumlah" />
            )}
          </Form.Item>
          <Form.Item label="Kartu Ternak Anak:">
            {getFieldDecorator("kartuTernakAnak", {
              initialValue: kartuTernakAnak,
            })(<Input placeholder="Masukkan kartu" />)}
          </Form.Item>
          <Form.Item label="Eartag Anak:">
            {getFieldDecorator("eartagAnak", { initialValue: eartagAnak })(
              <Input placeholder="Masukkan Eartag" />
            )}
          </Form.Item>
          <Form.Item label="ID Hewan Anak:">
            {getFieldDecorator("idHewanAnak", { initialValue: idHewanAnak })(
              <Input placeholder="Masukkan ID" />
            )}
          </Form.Item>
          <Form.Item label="Jenis Kelamin Anak:">
            {getFieldDecorator("jenisKelaminAnak", {
              initialValue: jenisKelaminAnak,
            })(
              <Select style={{ width: 150 }}>
                <Select.Option value="Betina">Betina</Select.Option>
                <Select.Option value="Jantan">Jantan</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Kategori:">
            {getFieldDecorator("kategori", { initialValue: kategori })(
              <Input placeholder="Masukkan kategori" />
            )}
          </Form.Item>
          <Form.Item label="Petugas Pelopor:">
            {getFieldDecorator("petugasPelopor", {
              initialValue: petugasPelopor,
            })(<Input placeholder="Masukkan Petugas" />)}
          </Form.Item>
          <Form.Item label="Urutan IB:">
            {getFieldDecorator("urutanIb", { initialValue: urutanIb })(
              <Input placeholder="Masukkan urutan " />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "EditKelahiranForm" })(EditKelahiranForm);
