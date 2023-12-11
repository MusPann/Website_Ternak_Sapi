import React, { Component } from "react";
import { Card, Button, Table, message, Upload, Row, Col, Divider, Modal, Input } from "antd";
import {
  getPeternaks,
  deletePeternak,
  editPeternak,
  addPeternak,
} from "@/api/peternak";
import TypingCard from "@/components/TypingCard";
import EditPeternakForm from "./forms/edit-peternak-form";
import AddPeternakForm from "./forms/add-peternak-form";
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { read, utils } from "xlsx";
import { reqUserInfo } from "../../api/user";
const { Column } = Table;

const checkIfDataExists = async (dataToCheck) => {
  try {
    
    const result = await getPeternaks();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const existingData = content.find((peternak) => {
        return peternak.nikPetugas === dataToCheck.nikPetugas;
      });

      if (existingData) {
        await editPeternak(existingData.nikPetugas, dataToCheck); 
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

class Peternak extends Component {
  constructor(props) {
      super(props);
      this.state = {
      peternaks: [],
      editPeternakModalVisible: false,
      editPeternakModalLoading: false,
      currentRowData: {},
      addPeternakModalVisible: false,
      addPeternakModalLoading: false,
      importModalVisible: false,
      importedData: [], // Tambahkan data import
      searchKeyword: "",
      user: null,
    };
  }

  getPeternaks = async () => {
    const result = await getPeternaks();
    const { content, statusCode } = result.data;
  
    if (statusCode === 200) {
      const filteredPeternaks = content.filter((peternak) => {
        const { namaPeternak, nikPeternak, idPeternak, petugasPendaftar, lokasi } = peternak;
        const keyword = this.state.searchKeyword.toLowerCase();
        
        const isNamaPeternakValid = typeof namaPeternak === 'string';
        const isNikPeternakValid = typeof nikPeternak === 'string';
        const isIdPeternakValid = typeof idPeternak === 'string';
        const isPetugasPendaftarValid = typeof petugasPendaftar === 'string';
        const isLokasiValid = typeof lokasi === 'string';

        return (
          (isNamaPeternakValid && namaPeternak.toLowerCase().includes(keyword)) ||
          (isNikPeternakValid && nikPeternak.toLowerCase().includes(keyword)) ||
          (isIdPeternakValid && idPeternak.toLowerCase().includes(keyword)) ||
          (isPetugasPendaftarValid && petugasPendaftar.toLowerCase().includes(keyword)) ||
          (isLokasiValid && lokasi.toLowerCase().includes(keyword))
        );
      });
  
      this.setState({
        peternaks: filteredPeternaks,
      });
    }
  };

  handleSearch = (keyword) => {
    this.setState({
      searchKeyword: keyword,
    }, () => {
      this.getPeternaks(); 
    });
  };

  handleEditPeternak = (row) => {
    this.setState({
      currentRowData: Object.assign({}, row),
      editPeternakModalVisible: true,
    });
  };

  handleDeletePeternak = (row) => {
    const { idPeternak } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => {
        deletePeternak({ idPeternak }).then((res) => {
          message.success("Berhasil dihapus");
          this.getPeternaks();
        });
      },
    });
  };

  handleEditPeternakOk = (_) => {
    const { form } = this.editPeternakFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ editModalLoading: true });
      editPeternak(values, values.idPeternak)
        .then((response) => {
          form.resetFields();
          this.setState({
            editPeternakModalVisible: false,
            editPeternakModalLoading: false,
          });
          message.success("Berhasil diedit!");
          this.getPeternaks();
        })
        .catch((e) => {
          message.success("Pengeditan gagal, harap coba lagi!");
        });
    });
  };

  //Fungsi Import File Csv
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
    let existCount = 0;
  
    try {
      await Promise.all(importedData.map(async (row) => {
        const dataToSave = {
          
          idPeternak: row[columnMapping["No. Eartag***)"] || columnMapping["ID"] ],
          nikPeternak: row[columnMapping["NIK Pemilik Ternak**)"] || columnMapping["NIK Peternak"] ],
          namaPeternak: row[columnMapping["Nama Pemilik Ternak**)"] || columnMapping["nama"] ],
          idISIKHNAS: row[columnMapping["ID isikhnas Pemilik**)"] || columnMapping["ID iSIKHNAS"]],
          lokasi: row[columnMapping["Alamat Pemilik Ternak**)"] || columnMapping["lokasi"]],
          petugasPendaftar: row[columnMapping["Petugas Pendaftar"] || columnMapping["Nama Petugas Pendataan*)"]],
          tanggalPendaftaran: row[columnMapping["Tanggal Pendataan"]] || this.convertToJSDate(row[columnMapping["Tanggal Pendaftaran"]]),
        };
  
        try {
          const isDataExists = await checkIfDataExists(dataToSave);
  
          if (!isDataExists) {
            // Lakukan pembaruan jika data sudah ada
            await addPeternak(dataToSave);
          } else if (isDataExists) {
            isDataExists = true;
            await editPeternak(dataToSave);
            existCount += 1;
          } else {
            // Tandai sebagai kesalahan jika data tidak ditemukan
            hasError = true;
            errorCount += 1; // Tambahkan 1 ke errorCount
          }
          existCount += 1;
        } catch (error) {
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
        message.success(`Berhasil mengedit ${existCount} data`);
      } else {
        message.error(`Gagal menyimpan ${errorCount} data, harap coba lagi!`);
        message.success(`Berhasil mengedit ${existCount} data`);
      }
  
    } catch (error) {
      console.error(error);
    } finally {
      this.setState({
        uploading: false,
        importModalVisible: false,
      });
      this.getPeternaks();
    }
  };
  

  handleCancel = (_) => {
    this.setState({
      editPeternakModalVisible: false,
      addPeternakModalVisible: false,
    });
  };

  handleAddPeternak = (row) => {
    this.setState({
      addPeternakModalVisible: true,
    });
  };

  handleAddPeternakOk = (_) => {
    const { form } = this.addPeternakFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ addPeternakModalLoading: true });
      addPeternak(values)
        .then((response) => {
          form.resetFields();
          this.setState({
            addPeternakModalVisible: false,
            addPeternakModalLoading: false,
          });
          message.success("Berhasil menambahkan!");
          this.getPeternaks();
        })
        .catch((e) => {
          message.success("Gagal menambahkan, harap coba lagi!");
        });
    });
  };
  componentDidMount() {
    this.getPeternaks();

    reqUserInfo()
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengambil data user:", error);
      });
  }

  //Fungsi Upload data dan save ke database
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
      this.saveImportedData(columnMapping);
    }, 2000);
  };
  
  //Fungsi Export dari database ke file csv
  handleExportData = () => {
    const { peternaks } = this.state;
    const csvContent = this.convertToCSV(peternaks);
    this.downloadCSV(csvContent);
  };

  convertToCSV = (data) => {
    const columnTitles = [
      "ID Peternak",
      "Nama Peternak",
      "ID ISIKHNAS",
      "NIK Peternak",
      "Lokasi",
      "Petugas Pendafatar",
      "Tanggal Pendafaran",
    ];

    const rows = [columnTitles];
    data.forEach((item) => {
      const row = [
        item.idPeternak,
        item.namaPeternak,
        item.idISIKHNAS,
        item.nikPeternak,
        item.lokasi,
        item.petugasPendaftar,
        moment(item.tanggalPendaftaran).format("DD/MM/YYYY"),
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
    link.setAttribute("download", "Peternak.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
  };
  
  render() {
    const { peternaks, importModalVisible, searchKeyword, user } = this.state;
    const columns = [
      {title:"ID Peternak", dataIndex:"idPeternak", key:"idPeternak"},
      {title:"NIK Peternak", dataIndex:"nikPeternak", key:"nikPeternak"},
      {title:"Nama Peternak", dataIndex:"namaPeternak", key:"namaPeternak"},
      {title:"ID ISIKHNAS", dataIndex:"idISIKHNAS", key:"idISIKHNAS"},
      {title:"Lokasi", dataIndex:"lokasi", key:"lokasi"},
      {title:"Petugas Pendaftar", dataIndex:"petugasPendaftar", key:"petugasPendaftar"},
      {title:"Tanggal Pendaftaran", dataIndex:"tanggalPendaftaran", key:"tanggalPendaftaran"},
    ];

    const renderTable = () => {
      if (user &&  user.role === 'ROLE_LECTURE') {
        return <Table dataSource={peternaks} bordered columns={columns} />;
      } else if (user && user.role === 'ROLE_ADMINISTRATOR') {
        return <Table dataSource={peternaks} bordered columns={(columns && renderColumns())}/>
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
              <Button type="primary" onClick={this.handleAddPeternak}>
                Tambah Peternak
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
                onClick={() => this.handleEditPeternak(row)}
              />
              <Divider type="vertical" />
              <Button
                type="primary"
                shape="circle"
                icon="delete"
                title="Delete"
                onClick={() => this.handleDeletePeternak(row)}
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
    const cardContent = `Di sini, Anda dapat mengelola daftar peternak di sistem.`;
    return (
      <div className="app-container">
        <TypingCard title="Manajemen Peternak" source={cardContent} />
        <br />
        <Card title={title} style={{ overflowX: "scroll" }}>
        {renderTable()}
        </Card>
        <EditPeternakForm
          currentRowData={this.state.currentRowData}
          wrappedComponentRef={(formRef) =>
            (this.editPeternakFormRef = formRef)
          }
          visible={this.state.editPeternakModalVisible}
          confirmLoading={this.state.editPeternakModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditPeternakOk}
        />
        <AddPeternakForm
          wrappedComponentRef={(formRef) =>
            (this.addPeternakFormRef = formRef)
          }
          visible={this.state.addPeternakModalVisible}
          confirmLoading={this.state.addPeternakModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddPeternakOk}
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

export default Peternak;
