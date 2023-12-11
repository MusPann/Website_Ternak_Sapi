import React, { Component } from "react";
import { Card, Button, Table, message, Upload, Row, Col, Divider, Modal, Input } from "antd";
// import { useTable } from "react-table-hooks";
import { getHewans, deleteHewan, editHewan, addHewan, addHewanWithoutFile } from "@/api/hewan";
import { read, utils } from "xlsx";
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import AddHewanForm from './forms/add-hewan-form';
import EditHewanForm from './forms/edit-hewan-form';
import TypingCard from "@/components/TypingCard";
import { reqUserInfo } from "../../api/user";
import imgUrl from "../../utils/imageURL";
import { getUserInfo } from "@/store/actions";
import {BlobImageDisplay} from "../../components/BlobImage/BlobImageDisplay"

const { Column } = Table;


const checkIfDataExists = async (dataToCheck) => {
  try {
    
    const result = await getHewans();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const existingData = content.find((hewan) => {
        return hewan.kodeEartagNasional === dataToCheck.kodeEartagNasional;
      });

      if (existingData) {
        await editHewan(existingData.kodeEartagNasional, dataToCheck); 
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

class Hewan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hewans: [],
      editHewanModalVisible: false,
      editHewanModalLoading: false,
      currentRowData: {},
      addHewanModalVisible: false,
      addHewanModalLoading: false,
      importModalVisible: false,
      importedData: [],
      searchKeyword: "",
      user: null, 
    };
  }

  
  //Fungsi ambil data dari database
  getHewans = async () => {
    const result = await getHewans();
    const { content, statusCode } = result.data;
  
    if (statusCode === 200) {
      const filteredHewans = content.filter((hewan) => {
        const { namaPeternak, kodeEartagNasional, petugasPendaftar, provinsi, kecamatan, kabupaten, desa } = hewan;
        const keyword = this.state.searchKeyword.toLowerCase();

        const isNamaPeternakValid = typeof namaPeternak === 'string';
        const isKodeEartagNasionalValid = typeof kodeEartagNasional === 'string';
        const isPetugasPendaftarValid = typeof petugasPendaftar === 'string';
        const isProvinsiValid = typeof provinsi === 'string';
        const isKecamatanValid = typeof kecamatan === 'string';
        const isKabupatenValid = typeof kabupaten === 'string';
        const isDesaValid = typeof desa === 'string';

        return (
          (isNamaPeternakValid && namaPeternak.toLowerCase().includes(keyword)) ||
          (isKodeEartagNasionalValid && kodeEartagNasional.toLowerCase().includes(keyword)) ||
          (isPetugasPendaftarValid && petugasPendaftar.toLowerCase().includes(keyword)) ||
          (isProvinsiValid && provinsi.toLowerCase().includes(keyword)) ||
          (isKecamatanValid && kecamatan.toLowerCase().includes(keyword)) ||
          (isKabupatenValid && kabupaten.toLowerCase().includes(keyword)) ||
          (isDesaValid && desa.toLowerCase().includes(keyword))
        );
      });
  
      this.setState({
        hewans: filteredHewans,
      });
    }
  };

  handleSearch = (keyword) => {
    this.setState({
      searchKeyword: keyword,
    }, () => {
      this.getHewans(); 
    });
  };

  //Fungsi Import File Csv
  handleImportModalOpen = () => {
    this.setState({ importModalVisible: true });
  };
  
  handleImportModalClose = () => {
    this.setState({ importModalVisible: false });
  };

  

  //Fungsi Edit Hewan
  handleEditHewan = (row) => {
    this.setState({
      currentRowData: Object.assign({}, row),
      editHewanModalVisible: true,
    });
  };

  handleEditHewanOk = (_) => {
    const { form } = this.editHewanFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ editModalLoading: true });
      editHewan(values, values.kodeEartagNasional)
        .then((response) => {
          form.resetFields();
          this.setState({
            editHewanModalVisible: false,
            editHewanModalLoading: false,
          });
          message.success("Berhasil diedit!");
          this.getHewans();
        })
        .catch((e) => {
          message.success("Pengeditan gagal, harap coba lagi!");
        });
    });
  };

  handleDeleteHewan = (row) => {
    const { kodeEartagNasional } = row;
  
    // Dialog alert hapus data
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => {
        deleteHewan({ kodeEartagNasional }).then((res) => {
          message.success("Berhasil dihapus");
          this.getHewans();
        });
      },
    });
  };

  handleCancel = (_) => {
    this.setState({
      editHewanModalVisible: false,
      addHewanModalVisible: false,
    });
  };

  //Fungsi Tambahkan Hewan
  handleAddHewan = (row) => {
    this.setState({
      addHewanModalVisible: true,
    });
  };

  handleAddHewanOk = (_) => {
    const { form } = this.addHewanFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ addHewanModalLoading: true });
      addHewan(values)
        .then((response) => {
          form.resetFields();
          this.setState({
            addHewanModalVisible: false,
            addHewanModalLoading: false,
          });
          message.success("Berhasil menambahkan!");
          this.getHewans();
        })
        .catch((e) => {
          message.success("Gagal menambahkan, harap coba lagi!");
        });
    });
  };

  componentDidMount() {
    this.getHewans();

    reqUserInfo()
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengambil data user:", error);
      });
  }

  handleFileImport = (file) => {
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: "array" });
  
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
  
      const importedData = jsonData.slice(1); // Exclude the first row (column titles)
  
      const columnTitles = jsonData[0]; // Assume the first row contains column titles
      
      // Create column mapping
      const columnMapping = {};
      columnTitles.forEach((title, index) => {
        columnMapping[title] = index;
      });

      // Iterate through importedData and split the 'alamat' column
      const modifiedData = importedData.map(row => {
        const alamatIndex = columnMapping["Alamat Pemilik Ternak**)"]; // Adjust this to your actual column name
        const alamat = row[alamatIndex] || ''; // Get the alamat value

        // Split alamat into its parts: desa, kecamatan, kabupaten, provinsi
        const [dusun, desa, kecamatan, kabupaten, provinsi] = alamat.split(',');

        // Create a new modified row with additional columns
        return {
          ...row,
          dusun,
          desa,
          kecamatan,
          kabupaten,
          provinsi
        };
      });

      this.setState({
        importedData: modifiedData,
        columnTitles,
        fileName: file.name.toLowerCase(),
        columnMapping
      });
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
          noKartuTernak: row[columnMapping["No Kartu Ternak***)"] || columnMapping["No Kartu Ternak"]],
          kodeEartagNasional: row[columnMapping["No. Eartag***)"] || columnMapping["Kode Eartag Nasional"]],
          provinsi: row.provinsi || row[columnMapping["Provinsi"]],
          kabupaten: row.kabupaten || row[columnMapping["Kabupaten"]],
          kecamatan : row.kecamatan || row[columnMapping["Kecamatan"]],
          desa: row.dusun || row[columnMapping["Desa"]],
          idPeternak: row[columnMapping["No. Eartag***)"] || columnMapping["ID Peternak"]],
          idKandang: row[columnMapping["ID Kandang"]],
          spesies: row[columnMapping["Rumpun Ternak"] || columnMapping["Spesies"]],
          sex: row[columnMapping["Jenis Kelamin**)"] || columnMapping["sex"]],
          umur: row[columnMapping["Tanggal Lahir Ternak**)"] || columnMapping["umur"]],
          identifikasiHewan: row[columnMapping["Identifikasi Hewan*)"] || columnMapping["Identifikasi Hewan"]],
          petugasPendaftar: row[columnMapping["Nama Petugas Pendataan*)"] || columnMapping["Petugas Pendaftar"]],
          tanggalTerdaftar: row[columnMapping["Tanggal Pendataan"]] || this.convertToJSDate(row[columnMapping["Tanggal Terdaftar"]]),
          latitude: row[columnMapping["Latitude"]],
          longitude: row[columnMapping["Longitude"]],
          file: row[columnMapping["File"]],
        };

        try {
          const isDataExists = await checkIfDataExists(dataToSave);
  
          if (!isDataExists) {
            // Lakukan pembaruan jika data sudah ada
            await addHewanWithoutFile(dataToSave);
          } else if (isDataExists) {
            isDataExists = true;
            await editHewan(dataToSave);
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
      this.getHewans();
    }
  };
  
  //Fungsi Export dari database ke file csv
  handleExportData = () => {
    const { hewans } = this.state;
    const csvContent = this.convertToCSV(hewans);
    this.downloadCSV(csvContent);
  };

  convertToCSV = (data) => {
    const columnTitles = [
      "No Kartu Ternak",
      "Kode Eartag Nasional",
      "Provinsi",
      "Kabupaten",
      "Kecamatan",
      "Desa",
      "Nama Peternak",
      "Id Peternak",
      "Id Kandang",
      "NIK Peternak",
      "Spesies",
      "Jenis Kelamin",
      "Umur",
      "Identifikasi Hewan",
      "Petugas Pendaftar",
      "Tanggal Terdaftar",
    ];

    const rows = [columnTitles];
    data.forEach((item) => {
      const row = [
        item.noKartuTernak,
        item.kodeEartagNasional,
        item.provinsi,
        item.kabupaten,
        item.kecamatan,
        item.desa,
        item.namaPeternak,
        item.idPeternak,
        item.idKandang,
        item.nikPeternak,
        item.spesies,
        item.sex,
        item.umur,
        item.identifikasiHewan,
        item.petugasPendaftar,
        item.tanggalTerdaftar,
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
    link.setAttribute("download", "Hewan.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
  };
  
  render() {
    const { hewans, importModalVisible, searchKeyword, user} = this.state;
    const columns = [
      { title: "No Kartu Ternak", dataIndex: "noKartuTernak", key: "noKartuTernak" },
      { title: "Kode Eartag Nasional", dataIndex: "kodeEartagNasional", key: "kodeEartagNasional" },
      { title: "Provinsi", dataIndex: "provinsi", key: "provinsi" },
      { title: "Kabupaten", dataIndex: "kabupaten", key: "kabupaten" },
      { title: "Kecamatan", dataIndex: "kecamatan", key: "kecamatan" },
      { title: "Desa", dataIndex: "desa", key: "desa" },
      { title: "Nama Peternak", dataIndex: ["idPeternak", "namaPeternak"], key: "namaPeternak" },
      { title: "Id Peternak", dataIndex: ["idPeternak", "idPeternak"], key: "idPeternak" },
      { title: "NIK Peternak", dataIndex: ["idPeternak", "nikPeternak"], key: "nikPeternak" },
      { title: "Id Kandang", dataIndex: ["idKandang", "idKandang"], key: "idKandang"},
      { title: "Spesies", dataIndex: "spesies", key: "spesies" },
      { title: "Jenis Kelamin", dataIndex: "sex", key: "sex" },
      { title: "Umur", dataIndex: "umur", key: "umur" },
      { title: "Identifikasi Hewan", dataIndex: "identifikasiHewan", key: "identifikasiHewan" },
      { title: "Petugas Pendaftar", dataIndex: "petugasPendaftar", key: "petugasPendaftar" },
      { title: "Tanggal Terdaftar", dataIndex: "tanggalTerdaftar", key: "tanggalTerdaftar" },
      { title: "Foto Hewan", dataIndex: "fotoHewan", key: "fotoHewan",  render: (text, row) => (
        <img
          src={`${imgUrl}${row.fotoHewan}`}
          width={200}
          height={150}
        />
      ),},
    ];

    const renderTable = () => {
      if (user &&  user.role === 'ROLE_LECTURE') {
        return <Table dataSource={hewans} bordered columns={columns} />;
      } else if (user && user.role === 'ROLE_ADMINISTRATOR') {
        return <Table dataSource={hewans} bordered columns={(columns && renderColumns())}/>
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
              <Button type="primary" onClick={this.handleAddHewan}>
                Tambah Hewan
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
                onClick={() => this.handleEditHewan(row)}
              />
              <Divider type="vertical" />
              <Button
                type="primary"
                shape="circle"
                icon="delete"
                title="Delete"
                onClick={() => this.handleDeleteHewan(row)}
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
    const cardContent = `Di sini, Anda dapat mengelola daftar hewan di sistem.`;
  
    return (
      <div className="app-container">
        {/* TypingCard component */}
        
        <TypingCard title="Manajemen Hewan" source={cardContent} />
        <br />
        <Card title={title} style={{ overflowX: "scroll" }}>
        {renderTable()}
        </Card>
        
        <EditHewanForm
          currentRowData={this.state.currentRowData}
          wrappedComponentRef={(formRef) =>
            (this.editHewanFormRef = formRef)
          }
          visible={this.state.editHewanModalVisible}
          confirmLoading={this.state.editHewanModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditHewanOk}
        />
        <AddHewanForm
          wrappedComponentRef={(formRef) =>
            (this.addHewanFormRef = formRef)
          }
          visible={this.state.addHewanModalVisible}
          confirmLoading={this.state.addHewanModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddHewanOk}
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


export default Hewan;
