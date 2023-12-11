import React, { Component } from "react";
import { Card, Button, Table, message, Row, Col, Divider, Modal, Upload, Input } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { getKelahiran, deleteKelahiran, editKelahiran, addKelahiran } from "@/api/kelahiran";
import { read, utils } from "xlsx";
import moment from 'moment';
import TypingCard from "@/components/TypingCard";
import AddKelahiranForm from './forms/add-kelahiran-form';
import EditKelahiranForm from './forms/edit-kelahiran-form';
import { reqUserInfo } from "../../api/user";

const { Column } = Table;
const checkIfDataExists = async (dataToCheck) => {
  try {
    
    const result = await getKelahiran();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const existingData = content.find((kelahiran) => {
        return kelahiran.idKejadian === dataToCheck.idKejadian;
      });

      if (existingData) {
        await editKelahiran(existingData.idKejadian, dataToCheck); 
        return true;
      } else {
        return false;
      }
    } else {
      console.error("Gagal memeriksa data:", result);
      return false; 
    }
  } catch (error) {
    console.error("Gagal memeriksa data:", error);
    return false;
  }
};
export { checkIfDataExists };

class Kelahiran extends Component {
  state = {
    kelahiran: [],
    editKelahiranModalVisible: false,
    editKelahiranModalLoading: false,
    currentRowData: {},
    addKelahiranModalVisible: false,
    addKelahiranModalLoading: false,
    importModalVisible: false,
    importedData: [],
    columnTitles: [],
    fileName: "",
    uploading: false,
    importModalVisible: false,
    columnMapping: {},
    searchKeyword: "",
    user: null,
  };

  getKelahiran = async () => {
    const result = await getKelahiran();
    console.log(result);
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const filteredKelahiran = content.filter((kelahiran) => {
        const { idKejadian, tanggalLaporan, tanggalLahir, lokasi, namaPeternak, 
        idPeternak, kartuTernakInduk, kartuTernakAnak,
        eartagInduk, eartagAnak, idHewanInduk, idHewanAnak,
        spesiesInduk, spesiesPejantan, idPejantanStraw, idBatchStraw,
        jenisKelaminAnak, kategori, petugasPelopor, produsenStraw} = kelahiran;
        const keyword = this.state.searchKeyword.toLowerCase();
        
        const isIdKejadianValid = typeof idKejadian === 'string';
        const isTanggalLaporanValid = typeof tanggalLaporan === 'string';
        const isTanggalLahirValid = typeof tanggalLahir === 'string';
        const isLokasiValid = typeof lokasi === 'string';
        const isNamaPeternakValid =  typeof namaPeternak === 'string';
        const isIdPeternakValid = typeof idPeternak === 'string';
        const isKartuTernakIndukValid = typeof kartuTernakInduk === 'string';
        const isKartuTernakAnakValid = typeof kartuTernakAnak === 'string';
        const isEartagIndukValid = typeof eartagInduk === 'string';
        const isEartagAnakValid = typeof eartagAnak === 'string';
        const isIdHewanIndukValid = typeof idHewanInduk === 'string';
        const isIdHewanAnakValid = typeof idHewanAnak === 'string';
        const isSpesiesIndukValid = typeof spesiesInduk === 'string';
        const isSpesiesPejantanValid = typeof spesiesPejantan === 'string';
        const isIdPejantanStrawValid = typeof idPejantanStraw === 'string';
        const isIdBatchStrawValid = typeof idBatchStraw === 'string';
        const isJenisKelaminAnakValid = typeof jenisKelaminAnak === 'string';
        const isKategoriValid = typeof kategori === 'string';
        const isPetugasPeloporValid = typeof petugasPelopor === 'string';
        const isProdusenStrawValid = typeof produsenStraw === 'string';

        return (
          (isIdKejadianValid && idKejadian.toLowerCase().includes(keyword)) ||
          (isTanggalLaporanValid && tanggalLaporan.toLowerCase().includes(keyword)) ||
          (isTanggalLahirValid && tanggalLahir.toLowerCase().includes(keyword)) ||
          (isLokasiValid && lokasi.toLowerCase().includes(keyword)) ||
          (isNamaPeternakValid && namaPeternak.toLowerCase().includes(keyword)) ||
          (isIdPeternakValid && idPeternak.toLowerCase().includes(keyword)) ||
          (isKartuTernakIndukValid && kartuTernakInduk.toLowerCase().includes(keyword)) ||
          (isSpesiesIndukValid && spesiesInduk.toLowerCase().includes(keyword)) ||
          (isKartuTernakAnakValid && kartuTernakAnak.toLowerCase().includes(keyword)) ||
          (isEartagIndukValid && eartagInduk.toLowerCase().includes(keyword)) ||
          (isEartagAnakValid && eartagAnak.toLowerCase().includes(keyword)) ||
          (isIdHewanIndukValid && idHewanInduk.toLowerCase().includes(keyword)) ||
          (isIdHewanAnakValid && idHewanAnak.toLowerCase().includes(keyword)) ||
          (isSpesiesPejantanValid && spesiesPejantan.toLowerCase().includes(keyword)) ||
          (isIdPejantanStrawValid && idPejantanStraw.toLowerCase().includes(keyword)) ||
          (isIdBatchStrawValid && idBatchStraw.toLowerCase().includes(keyword)) ||
          (isJenisKelaminAnakValid && jenisKelaminAnak.toLowerCase().includes(keyword)) ||
          (isKategoriValid && kategori.toLowerCase().includes(keyword)) ||
          (isPetugasPeloporValid && petugasPelopor.toLowerCase().includes(keyword)) ||
          (isProdusenStrawValid && produsenStraw.toLowerCase().includes(keyword))
        );
      });
  
      this.setState({
        kelahiran: filteredKelahiran,
      });
    }
  };

  handleSearch = (keyword) => {
    this.setState({
      searchKeyword: keyword,
    }, () => {
      this.getKelahiran(); 
    });
  };

  handleEditKelahiran = (row) => {
    this.setState({
      currentRowData: Object.assign({}, row),
      editKelahiranModalVisible: true,
    });
  };

  handleDeleteKelahiran = (row) => {
    const { idKejadian } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => {
        deleteKelahiran({ idKejadian }).then((res) => {
          message.success("Berhasil dihapus");
          this.getKelahiran();
        });
      },
    });
  };

  handleEditKelahiranOk = (_) => {
    const { form } = this.editKelahiranFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ editKelahiranModalLoading: true });
      editKelahiran(values, values.idKejadian)
        .then((response) => {
          form.resetFields();
          this.setState({
            editKelahiranModalVisible: false,
            editKelahiranModalLoading: false,
          });
          message.success("Berhasil diedit!");
          this.getKelahiran();
        })
        .catch((e) => {
          message.success("Pengeditan gagal, harap coba lagi!");
        });
    });
  };

  handleCancel = (_) => {
    this.setState({
      editKelahiranModalVisible: false,
      addKelahiranModalVisible: false,
      importModalVisible: false,
    });
  };

  handleAddKelahiran = (row) => {
    this.setState({
      addKelahiranModalVisible: true,
    });
  };

  handleAddKelahiranOk = (_) => {
    const { form } = this.addKelahiranFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ addKelahiranModalLoading: true });
      addKelahiran(values)
        .then((response) => {
          form.resetFields();
          this.setState({
            addKelahiranModalVisible: false,
            addKelahiranModalLoading: false,
          });
          message.success("Berhasil menambahkan!");
          this.getKelahiran();
        })
        .catch((e) => {
          message.success("Gagal menambahkan, harap coba lagi!");
        });
    });
  };

  handleImportModalOpen = () => {
    this.setState({ importModalVisible: true });
  };

  handleImportModalClose = () => {
    this.setState({ importModalVisible: false });
  };

  handleFileImport = (file) => {
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: "array" });
  
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
  
      const importedData = jsonData.slice(1); // Exclude the first row (column titles)
  
      const columnTitles = jsonData[0]; // Assume the first row contains column titles
  
      // Get the file name from the imported file
      const fileName = file.name.toLowerCase();
  
      this.setState({
        importedData,
        columnTitles,
        fileName, // Set the fileName in the state
      });

      // Create column mapping
      const columnMapping = {};
      columnTitles.forEach((title, index) => {
        columnMapping[title] = index;
      });
      this.setState({ columnMapping });
    };
    reader.readAsArrayBuffer(file);
  };

  handleUpload = () => {
    const { importedData, columnMapping } = this.state;

    if (importedData.length === 0) {
      message.error("No data to import.");
      return;
    }

    this.setState({ uploading: true });
    setTimeout(() => {
      this.setState({
        uploading: false,
        importModalVisible: false,
      });
      message.success("File uploaded successfully");
      this.saveImportedData(columnMapping);
    }, 2000);
  };

  convertToJSDate(input) {
    let date;
    
    if (typeof input === 'number') {
      const utcDays = Math.floor(input - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      date = new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate()).toString();
    } else if (typeof input === 'string') {
      const [day, month, year] = input.split('/');
      date = new Date(`${year}-${month}-${day}`).toString();
    }
  
    return date;
  }
 
  saveImportedData = async (columnMapping) => {
    const { importedData } = this.state;
    let hasError = false;
    let errorCount = 0;
    let existDataCount = 0;

    try {
      await Promise.all(importedData.map(async (row) => {
        const dataToSave = {
          idKejadian: row[columnMapping["id kejadian"]],
          tanggalLaporan: this.convertToJSDate(row[columnMapping["Tanggal laporan"]]) ,
          tanggalLahir: this.convertToJSDate(row[columnMapping["Tanggal lahir"]]) ,
          lokasi: row[columnMapping["Lokasi"]],
          namaPeternak: row[columnMapping["Nama Peternak"]],
          idPeternak: row[columnMapping["ID Peternak"]],
          kartuTernakInduk: row[columnMapping["kartu ternak induk"]],
          eartagInduk: row[columnMapping["eartag_induk"]],
          idHewanInduk: row[columnMapping["ID Hewan"]],
          spesiesInduk: row[columnMapping["Spesies Induk"]],
          idPejantanStraw: row[columnMapping["ID Pejantan Straw"]],
          idBatchStraw: row[columnMapping["ID Batch Straw"]],
          produsenStraw: row[columnMapping["Produsen Straw"]],
          spesiesPejantan: row[columnMapping["Spesies Pejantan"]],
          jumlah: row[columnMapping["Jumlah"]],
          kartuTernakAnak: row[columnMapping["kartu ternak anak"]],
          eartagAnak: row[columnMapping["eartag_anak"]],
          idHewanAnak: row[columnMapping["ID Hewan"]],
          jenisKelaminAnak: row[columnMapping["Jenis Kelamin Anak"]],
          kategori: row[columnMapping["kategori"]],
          petugasPelopor: row[columnMapping["Petugas Pelapor"]],
          urutanIb: row[columnMapping["urutan_ib"]],
        };
        try {
          const isDataExists = await checkIfDataExists(dataToSave);
  
          if (!isDataExists) {
            // Lakukan pembaruan jika data sudah ada
            await addKelahiran(dataToSave);
          } else if (isDataExists) {
            isDataExists = true;
            await editKelahiran(dataToSave);
            existDataCount += 1;
            
          } else {
            // Tandai sebagai kesalahan jika data tidak ditemukan
            hasError = true;
            errorCount += 1; // Tambahkan 1 ke errorCount
          }
          existDataCount += 1;
        } catch (error) {
          console.error("Gagal menyimpan data:", error);
          hasError = true;
          errorCount += 1; // Tambahkan 1 ke errorCount
        }
      })); 
        
      this.setState({
        importedData: [],
        columnTitles: [],
        columnMapping: {},
      });
  
      if (!hasError) {
        message.success(`Data berhasil disimpan ke database.`);
        message.success(`Berhasil mengedit ${existDataCount} data`);
      } else {
        message.error(`Gagal menyimpan ${errorCount} data, harap coba lagi!`);
        message.success(`Berhasil mengedit ${existDataCount} data`);
      }
  
    } catch (error) {
      console.error(error);
      message.error("Gagal menyimpan data: " + error.message);
    } finally {
      this.setState({
        uploading: false,
        importModalVisible: false,
      });
      this.getKelahiran();
    }
  };

  handleExportData = () => {
    const { kelahiran } = this.state;
    const csvContent = this.convertToCSV(kelahiran);
    this.downloadCSV(csvContent);
  };

  convertToCSV = (data) => {
    const columnTitles = [
      "ID Kejadian",
      "Tanggal Laporan",
      "Tanggal Lahir",
      "Lokasi",
      "Nama Peternak",
      "Id Peternak",
      "Kartu Ternak Induk",
      "Eartag Induk",
      "Id Hewan Induk",
      "Spesies Induk",
      "Id Pejantan Straw",
      "Id Batch Straw",
      "Produsen Straw",
      "Spesies Pejantan",
      "Jumlah",
      "Kartu Ternak Anak",
      "Eartag Anak",
      "Id Hewan Anak",
      "Jenis Kelamin Anak",
      "Kategori",
      "Petugas Pelopor",
      "Urutan Ib",
    ];

    const rows = [columnTitles];
    data.forEach((item) => {
      const row = [
        item.idKejadian,
        item.tanggalLaporan,
        item.tanggalLahir,
        item.lokasi,
        item.namaPeternak,
        item.idPeternak,
        item.kartuTernakInduk,
        item.eartagInduk,
        item.idHewanInduk,
        item.spesiesInduk,
        item.idPejantanStraw,
        item.idBatchStraw,
        item.produsenStraw,
        item.spesiesPejantan,
        item.jumlah,
        item.kartuTernakAnak,
        item.eartagAnak,
        item.idHewanAnak,
        item.jenisKelaminAnak,
        item.kategori,
        item.petugasPelopor,
        item.urutanIb,
      ];
      rows.push(row);
    });

    let csvContent = "data:text/csv;charset=utf-8,";

    rows.forEach((rowArray) => {
      const row = rowArray.join(";");
      csvContent += row + "\r\n";
    });

    return csvContent;
  };

  downloadCSV = (csvContent) => {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Kelahiran.csv");
    document.body.appendChild(link);
    link.click();
  };

  componentDidMount() {
    this.getKelahiran();

    reqUserInfo()
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengambil data user:", error);
      });
  }

  render() {
    const { kelahiran, importModalVisible, searchKeyword, user } = this.state;
    const columns = [
      {title: "ID Kejadian", dataIndex: "idKejadian", key: "idKejadian"},
      {title: "Tanggal Laporan", dataIndex: "tanggalLaporan", key: "tanggalLaporan"},
      {title: "Tanggal Lahir", dataIndex: "tanggalLahir", key: "tanggalLahir"},
      {title: "Lokasi", dataIndex: "lokasi", key: "lokasi"},
      {title: "Nama Peternak", dataIndex: ["idPeternak", "namaPeternak"], key: "namaPeternak"},
      {title: "ID Peternak", dataIndex: ["idPeternak", "idPeternak"], key: "idPeternak"},
      {title: "Kartu Ternak Induk", dataIndex: "kartuTernakInduk", key: "kartuTernakInduk"},
      {title: "Eartag Induk", dataIndex: "eartagInduk", key: "eartagInduk"},
      {title: "ID Hewan Induk", dataIndex: "idHewanInduk", key: "idHewanInduk"},
      {title: "Spesies Induk", dataIndex: "spesiesInduk", key: "spesiesInduk"},
      {title: "ID Pejantan Straw", dataIndex: "idPejantanStraw", key: "idPejantanStraw"},
      {title: "ID Batch Straw", dataIndex: "idBatchStraw", key: "idBatchStraw"},
      {title: "Produsen Straw", dataIndex: "produsenStraw", key: "produsenStraw"},
      {title: "Spesies Pejantan", dataIndex: "spesiesPejantan", key: "spesiesPejantan"},
      {title: "Jumlah", dataIndex: "jumlah", key: "jumlah"},
      { title: "Kartu Ternak Anak", dataIndex: "kartuTernakAnak", key: "kartuTernakAnak"},
      {title: "Eartag Anak", dataIndex: "eartagAnak", key: "eartagAnak"},
      {title: "ID Hewan Anak", dataIndex: "idHewanAnak", key: "idHewanAnak"},
      { title: "Jenis Kelamin Anak", dataIndex: "jenisKelaminAnak", key: "jenisKelaminAnak"},
      {title: "Kategori", dataIndex: "kategori", key: "kategori"},
      {title: "Petugas Pelopor", dataIndex: "petugasPelopor", key: "petugasPelopor"},
      {title: "Urutan IB", dataIndex: "urutanIb", key: "urutanIb"}
    ];

    const renderTable = () => {
      if (user &&  user.role === 'ROLE_LECTURE') {
        return <Table dataSource={kelahiran} bordered columns={columns} />;
      } else if (user && user.role === 'ROLE_ADMINISTRATOR') {
        return <Table dataSource={kelahiran} bordered columns={(columns && renderColumns())}/>
      }
      else {
        return null;
      }
    };
  
    const renderButtons = () => {
      if (user && user.role === 'ROLE_ADMINISTRATOR') {
        return (
          <Row gutter={[16, 16]} justify="start" style={{paddingLeft: 9}}>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Button type="primary" onClick={this.addKelahiran}>
                Tambah Kelahiran
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Button icon={<UploadOutlined />} onClick={this.handleImportModalOpen}>
                Import File
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Button icon={<UploadOutlined />} onClick={this.handleExportData}>
                Export File
              </Button>
            </Col>
          </Row>
        );
      } else {
        return null;
      }
    };
  
    const renderColumns = () => {
      if (user && user.role === 'ROLE_ADMINISTRATOR') {
        columns.push({
          title: "Operasi",
          key: "action",
          width: 120,
          align: "center",
          render: (text, row) => (
            <span>
              <Button
                type="primary"
                shape="circle"
                icon="edit"
                title="Edit"
                onClick={() => this.handleEditKelahiran(row)}
              />
              <Divider type="vertical" />
              <Button
                type="primary"
                shape="circle"
                icon="delete"
                title="Delete"
                onClick={() => this.handleDeleteKelahiran(row)}
              />
            </span>
          ),
        });
      }
      return columns;
    };
  
    const title = (
      <Row gutter={[16, 16]} justify="start">
        {renderButtons()}
        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Input
            placeholder="Cari data"
            value={searchKeyword}
            onChange={(e) => this.handleSearch(e.target.value)}
            style={{ width: 235, marginRight: 10 }}
          />
        </Col>
      </Row>
    );
  
    const { role } = user ? user.role : '';
    console.log("peran pengguna:",role);
    const cardContent = `Di sini, Anda dapat mengelola daftar kelahiran di sistem.`;

    return (
      <div className="app-container">
        <TypingCard title="Manajemen Kelahiran" source={cardContent} />
        <br />
        <Card title={title} style={{ overflowX: "scroll" }}>
        {renderTable()}
        </Card>
        <EditKelahiranForm
          currentRowData={this.state.currentRowData}
          wrappedComponentRef={(formRef) =>
            (this.editKelahiranFormRef = formRef)
          }
          visible={this.state.editKelahiranModalVisible}
          confirmLoading={this.state.editKelahiranModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditKelahiranOk}
        />
        <AddKelahiranForm
          wrappedComponentRef={(formRef) =>
            (this.addKelahiranFormRef = formRef)
          }
          visible={this.state.addKelahiranModalVisible}
          confirmLoading={this.state.addKelahiranModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddKelahiranOk}
        />
        <Modal
          title="Import File"
          visible={importModalVisible}
          onCancel={this.handleImportModalClose}
          footer={[
            <Button key="cancel" onClick={this.handleImportModalClose}>
              Cancel
            </Button>,
            <Button
              key="upload"
              type="primary"
              loading={this.state.uploading}
              onClick={this.handleUpload}
            >
              Upload
            </Button>,
          ]}
        >
          <Upload beforeUpload={this.handleFileImport}>
            <Button icon={<UploadOutlined />}>Pilih File</Button>
          </Upload>
        </Modal>
      </div>
    );
  }
}

export default Kelahiran;
