import React, { Component } from "react";
import { Card, Button, Table, message, Upload, Row, Col, Divider, Modal, Input } from "antd";
import {
  getKandang,
  getKandangWithPeternakInfo,
  deleteKandang,
  editKandang,
  addKandang,
  addKandangWithoutFile,
} from "@/api/kandang";
import TypingCard from "@/components/TypingCard";
import EditKandangForm from "./forms/edit-kandang-form";
import AddKandangForm from "./forms/add-kandang-form";
import { read, utils } from "xlsx";
import { UploadOutlined } from '@ant-design/icons';
import { reqUserInfo } from "../../api/user";
import imgUrl from "../../utils/imageURL";

const { Column } = Table;

const checkIfDataExists = async (dataToCheck) => {
  try {
    
    const result = await getKandang();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const existingData = content.find((kandang) => {
        return kandang.idKandang === dataToCheck.idKandang;
      });

      if (existingData) {
        await editKandang(existingData.idKandang, dataToCheck); 
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

class Kandang extends Component {
  state = {
    kandang: [],
    editKandangModalVisible: false,
    editKandangModalLoading: false,
    currentRowData: {},
    addKandangModalVisible: false,
    addKandangModalLoading: false,
    importedData: [],
    columnTitles: [],
    fileName: "",
    uploading: false,
    importModalVisible: false,
    columnMapping: {},
    searchKeyword: "",
  };

  getKandang = async () => {
    const result = await getKandangWithPeternakInfo();
    console.log(result);
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const filteredKandang = content.filter((kandang) => {
        const { idKandang, idPeternak, namaPeternak, luas,
        kapasitas, nilaiBangunan, alamat,provinsi, 
        kabupaten, kecamatan, desa,} = kandang;
        const keyword = this.state.searchKeyword.toLowerCase();
        
        const isIdKandangValid = typeof idKandang === 'string';
        const isIdPeternakValid = typeof idPeternak === 'string';
        const isNamaPeternakValid = typeof namaPeternak === 'string';
        const isLuasValid = typeof luas === 'string';
        const isKapasitasValid = typeof kapasitas === 'string';
        const isNilaiBangunanValid = typeof nilaiBangunan === 'string';
        const isAlamatValid = typeof alamat === 'string';
        const isProvinsiValid = typeof provinsi === 'string';
        const isKabupatenValid = typeof kabupaten === 'string';
        const isKecamatanValid = typeof kecamatan === 'string';
        const isDesaValid = typeof desa === 'string';
      
        return (
          (isIdKandangValid && idKandang.toLowerCase().includes(keyword)) ||
          (isIdPeternakValid && idPeternak.toLowerCase().includes(keyword)) ||
          (isNamaPeternakValid && namaPeternak.toLowerCase().includes(keyword)) ||
          (isLuasValid && luas.toLowerCase().includes(keyword)) ||
          (isKapasitasValid && kapasitas.toLowerCase().includes(keyword)) ||
          (isNilaiBangunanValid && nilaiBangunan.toLowerCase().includes(keyword)) ||
          (isAlamatValid && alamat.toLowerCase().includes(keyword)) ||
          (isProvinsiValid && provinsi.toLowerCase().includes(keyword)) ||
          (isKabupatenValid && kabupaten.toLowerCase().includes(keyword)) ||
          (isKecamatanValid && kecamatan.toLowerCase().includes(keyword)) ||
          (isDesaValid && desa.toLowerCase().includes(keyword)) 
        );
      });
  
      this.setState({
        kandang: filteredKandang,
      });
    }
  };

  handleSearch = (keyword) => {
    this.setState({
      searchKeyword: keyword,
    }, () => {
      this.getKandang(); 
    });
  };

  handleEditKandang = (row) => {
    this.setState({
      currentRowData: Object.assign({}, row),
      editKandangModalVisible: true,
    });
  };

  handleDeleteKandang = (row) => {
    const { idKandang } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => {
        deleteKandang({ idKandang }).then((res) => {
          message.success("Berhasil dihapus");
          this.getKandang();
        });
      },
    });
  };

  handleEditKandangOk = (_) => {
    const { form } = this.editKandangFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ editModalLoading: true });
      editKandang(values, values.idKandang)
        .then((response) => {
          form.resetFields();
          this.setState({
            editKandangModalVisible: false,
            editKandangModalLoading: false,
          });
          message.success("Berhasil diedit!");
          this.getKandang();
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
          idKandang: row[columnMapping["ID Kandang"]],
          idPeternak: row[columnMapping["ID Peternak"]],
          luas: row[columnMapping["Luas"]],
          kapasitas: row[columnMapping["Kapasitas"]],
          nilaiBangunan: row[columnMapping["Nilai Bangunan"]],
          alamat: row[columnMapping["Alamat"]],
          provinsi: row[columnMapping["Provinsi"]],
          kabupaten: row[columnMapping["Kabupaten"]],
          kecamatan: row[columnMapping["Kecamatan"]],
          desa: row[columnMapping["Desa"]],
          latitude: row[columnMapping["Latitude"]],
          longitude: row[columnMapping["Longitude"]],
        };
      
      try {
        const isDataExists = await checkIfDataExists(dataToSave);

        if (!isDataExists) {
          // Lakukan pembaruan jika data sudah ada
          await addKandangWithoutFile(dataToSave);
        } else if (isDataExists) {
          isDataExists = true;
          await editKandang(dataToSave);
          existDataCount += 1;
          
        } else {
          // Tandai sebagai kesalahan jika data tidak ditemukan
          hasError = true;
          errorCount += 1; // Tambahkan 1 ke errorCount
        }
        existDataCount += 1;
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
      message.success(`Berhasil mengedit ${existDataCount} data`);
    } else {
      message.error(`Gagal menyimpan ${errorCount} data, harap coba lagi!`);
      message.success(`Berhasil mengedit ${existDataCount} data`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    this.setState({
      uploading: false,
      importModalVisible: false,
    });
    this.getKandang();
  }
};

  //Fungsi Export dari database ke file csv
  handleExportData = () => {
    const { kandang } = this.state;
    const csvContent = this.convertToCSV(kandang);
    this.downloadCSV(csvContent);
  };

  convertToCSV = (data) => {
    const columnTitles = [
      "Id Kandang",
      "Id Peternak",
      "Nama Peternak",
      "Luas",
      "Kapasitas",
      "Nilai Bangunan",
      "Alamat",
      "Provinsi",
      "Kabupaten",
      "Kecamatan",
      "Desa",
    ];

    const rows = [columnTitles];
    data.forEach((item) => {
      const row = [
        item.idKandang,
        item.idPeternak,
        item.namaPeternak,
        item.luas,
        item.kapasitas,
        item.nilaiBangunan,
        item.alamat,
        item.provinsi,
        item.kabupaten,
        item.kecamatan,
        item.desa,
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
    link.setAttribute("download", "Kandang.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
  };

  handleCancel = (_) => {
    this.setState({
      editKandangModalVisible: false,
      addKandangModalVisible: false,
    });
  };

  handleAddKandang = (row) => {
    this.setState({
      addKandangModalVisible: true,
    });
  };

  handleAddKandangOk = (_) => {
    const { form } = this.addKandangFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ addKandangModalLoading: true });
      addKandang(values)
        .then((response) => {
          form.resetFields();
          this.setState({
            addKandangModalVisible: false,
            addKandangModalLoading: false,
          });
          message.success("Berhasil menambahkan!");
          this.getKandang();
        })
        .catch((e) => {
          message.success("Gagal menambahkan, harap coba lagi!");
        });
    });
  };
  componentDidMount() {
    this.getKandang();
    
    reqUserInfo()
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengambil data user:", error);
      });
  }
  render() {
    const { kandang, importModalVisible, searchKeyword, user } = this.state;
    const columns = [
      { title: "Id Kandang", dataIndex: "idKandang", key: "idKandang" },
      { title: "Id Peternak", dataIndex: ["idPeternak", "idPeternak"], key: "idPeternak" },
      { title: "Nama Peternak", dataIndex: ["idPeternak", "namaPeternak"], key: "namaPeternak" },
      { title: "Luas", dataIndex: "luas", key: "luas" },
      { title: "Kapasitas", dataIndex: "kapasitas", key: "kapasitas" },
      { title: "Nilai Bangunan", dataIndex: "nilaiBangunan", key: "nilaiBangunan" },
      { title: "Alamat", dataIndex: "alamat", key: "alamat" },
      { title: "Provinsi", dataIndex: "provinsi", key: "provinsi" },
      { title: "Kabupaten", dataIndex: "kabupaten", key: "kabupaten" },
      { title: "Kecamatan", dataIndex: "kecamatan", key: "kecamatan" },
      { title: "Desa", dataIndex: "desa", key: "desa" },
      { title: "Foto Kandang", dataIndex: "fotoKandang", key: "fotoKandang",  render: (text, row) => (
        <img
          src={`${imgUrl}${row.fotoKandang}`}
          width={200}
          height={150}
        />
      ),},
    ];

    const renderTable = () => {
      if (user &&  user.role === 'ROLE_LECTURE') {
        return <Table dataSource={kandang} bordered columns={columns} />;
      } else if (user && user.role === 'ROLE_ADMINISTRATOR') {
        return <Table dataSource={kandang} bordered columns={(columns && renderColumns())}/>
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
              <Button type="primary" onClick={this.handleAddKandang}>
                Tambah Kandang
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
                onClick={() => this.handleEditKandang(row)}
              />
              <Divider type="vertical" />
              <Button
                type="primary"
                shape="circle"
                icon="delete"
                title="Delete"
                onClick={() => this.handleDeleteKandang(row)}
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
    const cardContent = `Di sini, Anda dapat mengelola daftar kandang di sistem.`;
    return (
      <div className="app-container">
        <TypingCard title="Manajemen Data Kandang" source={cardContent} />
        <br />
        <Card title={title} style={{ overflowX: "scroll" }}>
        {renderTable()}
        </Card>
        <EditKandangForm
          currentRowData={this.state.currentRowData}
          wrappedComponentRef={(formRef) =>
            (this.editKandangFormRef = formRef)
          }
          visible={this.state.editKandangModalVisible}
          confirmLoading={this.state.editKandangModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditKandangOk}
        />
        <AddKandangForm
          wrappedComponentRef={(formRef) =>
            (this.addKandangFormRef = formRef)
          }
          visible={this.state.addKandangModalVisible}
          confirmLoading={this.state.addKandangModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddKandangOk}
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

export default Kandang;
