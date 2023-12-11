import React, { Component } from "react";
import { Card, Button, Table, message, Row, Col, Divider, Modal, Upload, Input } from "antd";
import { getPeternaks } from "@/api/peternak";
import { getInseminasiBuatans, deleteInseminasiBuatan, editInseminasiBuatan, addInseminasiBuatan } from "@/api/inseminasi-buatan";
import { UploadOutlined } from '@ant-design/icons';
import { read, utils } from "xlsx";
import moment from 'moment';
import AddInseminasiBuatanForm from './forms/add-inseminasi-form';
import EditInseminasiBuatanForm from './forms/edit-inseminasi-form';
import TypingCard from "@/components/TypingCard";
import { reqUserInfo } from "../../api/user";

const { Column } = Table;
const checkIfDataExists = async (dataToCheck) => {
  try {
    
    const result = await getInseminasiBuatans();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const existingData = content.find((inseminasi) => {
        return inseminasi.idInseminasi === dataToCheck.idInseminasi;
      });

      if (existingData) {
        await editInseminasiBuatan(existingData.idInseminasi, dataToCheck); 
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

class InseminasiBuatan extends Component {
  state = {
    inseminasiBuatans: [],
    peternaks: [],
    editInseminasiBuatanModalVisible: false,
    editInseminasiBuatanModalLoading: false,
    currentRowData: {},
    addInseminasiBuatanModalVisible: false,
    addInseminasiBuatanModalLoading: false,
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

  getInseminasiBuatans = async () => {
    const result = await getInseminasiBuatans();

    console.log(result);
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const filteredInseminasi = content.filter((inseminasi) => {
        const { idInseminasi, idPeternak, namaPeternak, kodeEartagNasional,
        idPejantan, idPembuatan, bangsaPejantan, produsen, inseminator, lokasi } = inseminasi;
        const keyword = this.state.searchKeyword.toLowerCase();
        
        const isIdInseminasiValid = typeof idInseminasi === 'string';
        const isIdPeternakValid = typeof idPeternak === 'string';
        const isNamaPeternakValid = typeof namaPeternak === 'string';
        const isKodeEartagNasionalValid = typeof kodeEartagNasional === 'string';
        const isIdPejantanValid = typeof idPejantan === 'string';
        const isIdPembuatanValid = typeof idPembuatan === 'string';
        const isBangsaPejantanValid = typeof bangsaPejantan === 'string';
        const isProdusenValid = typeof produsen === 'string';
        const isInseminatorValid = typeof inseminator === 'string';
        const isLokasiValid = typeof lokasi === 'string';

        return (
          (isIdInseminasiValid && idInseminasi.toLowerCase().includes(keyword)) ||
          (isIdPeternakValid && idPeternak.toLowerCase().includes(keyword)) ||
          (isNamaPeternakValid && namaPeternak.toLowerCase().includes(keyword)) ||
          (isKodeEartagNasionalValid && kodeEartagNasional.toLowerCase().includes(keyword)) ||
          (isIdPejantanValid && idPejantan.toLowerCase().includes(keyword)) ||
          (isIdPembuatanValid && idPembuatan.toLowerCase().includes(keyword)) ||
          (isBangsaPejantanValid && bangsaPejantan.toLowerCase().includes(keyword)) ||
          (isProdusenValid && produsen.toLowerCase().includes(keyword)) ||
          (isInseminatorValid && inseminator.toLowerCase().includes(keyword)) ||
          (isLokasiValid && lokasi.toLowerCase().includes(keyword)) 
        );
      });
  
      this.setState({
        inseminasiBuatans: filteredInseminasi,
      });
    }
  };

  handleSearch = (keyword) => {
    this.setState({
      searchKeyword: keyword,
    }, () => {
      this.getInseminasiBuatans(); 
    });
  };

  getPeternaks = async () => {
    const result = await getPeternaks();
    console.log(result);
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      this.setState({
        peternaks: content,
      });
    }
  };

  handleEditInseminasiBuatan = (row) => {
    this.setState({
      currentRowData: Object.assign({}, row),
      editInseminasiBuatanModalVisible: true,
    });
  };

  handleEditInseminasiBuatanOk = (_) => {
    const { form } = this.editInseminasiBuatanFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ editInseminasiBuatanModalLoading: true });
      editInseminasiBuatan(values, values.idInseminasi)
        .then((response) => {
          form.resetFields();
          this.setState({
            editInseminasiBuatanModalVisible: false,
            editInseminasiBuatanModalLoading: false,
          });
          message.success("Berhasil diedit!");
          this.getInseminasiBuatans();
        })
        .catch((e) => {
          message.success("Pengeditan gagal, harap coba lagi!");
        });
    });
  };

  handleDeleteInseminasiBuatan = (row) => {
    const { idInseminasi } = row;

    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => {
        deleteInseminasiBuatan({ idInseminasi }).then((res) => {
          message.success("Berhasil dihapus");
          this.getInseminasiBuatans();
        });
      },
    });
  };

  handleCancel = (_) => {
    this.setState({
      editInseminasiBuatanModalVisible: false,
      addInseminasiBuatanModalVisible: false,
      importModalVisible: false,
    });
  };

  handleAddInseminasiBuatan = (row) => {
    this.setState({
      addInseminasiBuatanModalVisible: true,
    });
  };

  handleAddInseminasiBuatanOk = (_) => {
    const { form } = this.addInseminasiBuatanFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ addInseminasiBuatanModalLoading: true });
      addInseminasiBuatan(values)
        .then((response) => {
          form.resetFields();
          this.setState({
            addInseminasiBuatanModalVisible: false,
            addInseminasiBuatanModalLoading: false,
          });
          message.success("Berhasil menambahkan!");
          this.getInseminasiBuatans();
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

  saveImportedData = async (columnMapping) => {
    const { importedData } = this.state;
    let hasError = false;
    let errorCount = 0;
    let existDataCount = 0;

    try {
      await Promise.all(importedData.map(async (row) => {
        const dataToSave = {
          idInseminasi: row[columnMapping["ID"]],
          tanggalIB: new  Date((row[columnMapping["Tanggal IB"]] - 25569)*86400*1000).toString(),
          lokasi: row[columnMapping["Lokasi"]], 
          namaPeternak: row[columnMapping["Nama Peternak"]],
          idPeternak: row[columnMapping["ID Peternak"]],
          kodeEartagNasional: row[columnMapping["Eartag"]],
          ib1: row[columnMapping["IB 1"]],
          ib2: row[columnMapping["IB 2"]],
          ib3: row[columnMapping["IB 3"]],
          ibLain: row[columnMapping["IB lain"]],
          idPejantan: row[columnMapping["ID Pejantan"]],
          idPembuatan: row[columnMapping["ID Pembuatan"]],
          bangsaPejantan: row[columnMapping["Bangsa Pejantan"]],
          produsen: row[columnMapping["Produsen"]],
          inseminator: row[columnMapping["Inseminator"]],
        };
        try {
          const isDataExists = await checkIfDataExists(dataToSave);
  
          if (!isDataExists) {
            // Lakukan pembaruan jika data sudah ada
            await addInseminasiBuatan(dataToSave);
          } else if (isDataExists) {
            isDataExists = true;
            await editInseminasiBuatan(dataToSave);
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
      this.getInseminasiBuatans();
    }
  };

  handleExportData = () => {
    const { inseminasiBuatans } = this.state;
    const csvContent = this.convertToCSV(inseminasiBuatans);
    this.downloadCSV(csvContent);
  };

  convertToCSV = (data) => {
    const columnTitles = [
      "ID Inseminasi",
      "Tanggal IB",
      "Lokasi",
      "Nama Peternak",
      "ID Peternak",
      "Kode Eartag",
      "IB 1",
      "IB 2",
      "IB 3",
      "IB Lain",
      "ID Pejantan",
      "ID Pembuatan",
      "Bangsa Pejantan",
      "Produsen",
      "Inseminator",
    ];

    const rows = [columnTitles];
    data.forEach((item) => {
      const row = [
        item.idInseminasi,
        item.tanggalIB,
        item.lokasi,
        item.namaPeternak,
        item.idPeternak,
        item.kodeEartagNasional,
        item.ib1,
        item.ib2,
        item.ib3,
        item.ibLain,
        item.idPejantan,
        item.idPembuatan,
        item.bangsaPejantan,
        item.produsen,
        item.inseminator,
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
    link.setAttribute("download", "InseminasiBuatan.csv");
    document.body.appendChild(link);
    link.click();
  };

  componentDidMount() {
    this.getInseminasiBuatans();
    this.getPeternaks();

    reqUserInfo()
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengambil data user:", error);
      });
  }

  render() {
    const { inseminasiBuatans, peternaks, importModalVisible, searchKeyword, user } = this.state;
    const columns = [
      {title:"ID Inseminasi", dataIndex:"idInseminasi", key:"idInseminasi"},
      {title:"Tanggal IB", dataIndex:"tanggalIB", key:"tanggalIB"},
      {title:"Lokasi", dataIndex:"lokasi", key:"lokasi"},
      {title:"Nama Peternak", dataIndex:["idPeternak", "namaPeternak"], key:"namaPeternak"},
      {title:"ID Peternak", dataIndex:["idPeternak", "idPeternak"], key:"idPeternak"},
      {title:"Kode Eartag", dataIndex:["kodeEartagNasional", "kodeEartagNasional"], key:"kodeEartagNasional"},
      {title:"IB 1", dataIndex:"ib1", key:"ib1"},
      {title:"IB 2", dataIndex:"ib2", key:"ib2"},
      {title:"IB 3", dataIndex:"ib3", key:"ib3"},
      {title:"IB Lain", dataIndex:"ibLain", key:"ibLain"},
      {title:"ID Pejantan", dataIndex:"idPejantan", key:"idPejantan"},
      {title:"ID Pembuatan", dataIndex:"idPembuatan", key:"idPembuatan"},
      {title:"Bangsa Pejantan", dataIndex:"bangsaPejantan", key:"bangsaPejantan"},
      {title:"Produsen", dataIndex:"produsen", key:"produsen"},
      {title:"inseminator", dataIndex:"inseminator", key:"inseminator"},
    ];

    const renderTable = () => {
      if (user &&  user.role === 'ROLE_LECTURE') {
        return <Table dataSource={inseminasiBuatans} bordered columns={columns} />;
      } else if (user && user.role === 'ROLE_ADMINISTRATOR') {
        return <Table dataSource={inseminasiBuatans} bordered columns={(columns && renderColumns())}/>
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
              <Button type="primary" onClick={this.handleAddInseminasiBuatan}>
                Tambah Inseminasi Buatan
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
                onClick={() => this.handleEditInseminasiBuatan(row)}
              />
              <Divider type="vertical" />
              <Button
                type="primary"
                shape="circle"
                icon="delete"
                title="Delete"
                onClick={() => this.handleDeleteInseminasiBuatan(row)}
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
    const cardContent = `Di sini, Anda dapat mengelola daftar inseminasi di sistem.`;

    return (
      <div className="app-container">
        <TypingCard title="Manajemen Inseminasi Buatan" source={cardContent} />
        <br />
        <Card title={title} style={{ overflowX: "scroll" }}>
        {renderTable()}
        </Card>
        <EditInseminasiBuatanForm
          currentRowData={this.state.currentRowData}
          wrappedComponentRef={(formRef) =>
            (this.editInseminasiBuatanFormRef = formRef)
          }
          visible={this.state.editInseminasiBuatanModalVisible}
          confirmLoading={this.state.editInseminasiBuatanModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditInseminasiBuatanOk}
        />
        <AddInseminasiBuatanForm
          wrappedComponentRef={(formRef) =>
            (this.addInseminasiBuatanFormRef = formRef)
          }
          visible={this.state.addInseminasiBuatanModalVisible}
          confirmLoading={this.state.addInseminasiBuatanModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddInseminasiBuatanOk}
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

export default InseminasiBuatan;
