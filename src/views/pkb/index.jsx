import React, { Component } from "react";
import { Card, Button, Table, message, Row, Col, Divider, Modal, Upload, Input } from "antd";
import { getPkb, deletePkb, editPkb, addPkb } from "@/api/pkb";
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { read, utils } from "xlsx";
import TypingCard from "@/components/TypingCard";
import EditPkbForm from "./forms/edit-pkb-form";
import AddPkbForm from "./forms/add-pkb-form";
import { reqUserInfo } from "../../api/user";

const { Column } = Table;

const checkIfDataExists = async (dataToCheck) => {
  try {
    
    const result = await getPkb();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const existingData = content.find((pkb) => {
        return pkb.idKejadian === dataToCheck.idKejadian;
      });

      if (existingData) {
        await editPkb(existingData.idKejadian, dataToCheck); 
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

class Pkb extends Component {
  state = {
    pkb: [],
    editPkbModalVisible: false,
    editPkbModalLoading: false,
    currentRowData: {},
    addPkbModalVisible: false,
    addPkbModalLoading: false,
    importModalVisible: false,
    importedData: [],
    columnTitles: [],
    fileName: "",
    uploading: false,
    columnMapping: {},
    searchKeyword: "", 
    user: null,
  };

  // Fungsi ambil data dari database
  getPkb = async () => {
    const result = await getPkb();
    console.log(result);
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      const filteredPKB = content.filter((pkb) => {
        const { idKejadian, idPeternak, idHewan, tanggalPkb,
        lokasi, namaPeternak, nikPeternak, 
        spesies, kategori, pemeriksaKebuntingan } = pkb;
        const keyword = this.state.searchKeyword.toLowerCase();
        
        const isIdKejadianValid = typeof idKejadian === 'string';
        const isIdPeternakValid = typeof idPeternak === 'string';
        const isIdHewanValid = typeof idHewan === 'string';
        const isTanggalPKBValid = typeof tanggalPkb === 'string';
        const isLokasiValid = typeof lokasi === 'string';
        const isNamaPeternakValid = typeof namaPeternak === 'string';
        const isNikPeternakValid = typeof nikPeternak === 'string';
        const isSpesiesValid = typeof spesies === 'string';
        const isKategoriValid = typeof kategori === 'string';
        const isPemeriksaKebuntinganValid = typeof pemeriksaKebuntingan === 'string';

        return (
          (isIdKejadianValid && idKejadian.toLowerCase().includes(keyword)) ||
          (isIdPeternakValid && idPeternak.toLowerCase().includes(keyword)) ||
          (isIdHewanValid && idHewan.toLowerCase().includes(keyword)) ||
          (isTanggalPKBValid && tanggalPkb.toLowerCase().includes(keyword)) ||
          (isLokasiValid && lokasi.toLowerCase().includes(keyword)) ||
          (isNamaPeternakValid && namaPeternak.toLowerCase().includes(keyword)) ||
          (isNikPeternakValid && nikPeternak.toLowerCase().includes(keyword)) ||
          (isSpesiesValid && spesies.toLowerCase().includes(keyword)) ||
          (isKategoriValid && kategori.toLowerCase().includes(keyword)) ||
          (isPemeriksaKebuntinganValid && pemeriksaKebuntingan.toLowerCase().includes(keyword))
        );
      });
  
      this.setState({
        pkb: filteredPKB,
      });
    }
  };

  handleSearch = (keyword) => {
    this.setState({
      searchKeyword: keyword,
    }, () => {
      this.getPkb(); 
    });
  };

  // Fungsi Import File Csv
  handleImportModalOpen = () => {
    this.setState({ importModalVisible: true });
  };

  handleImportModalClose = () => {
    this.setState({ importModalVisible: false });
  };

  // Fungsi Edit Pkb
  handleEditPkb = (row) => {
    this.setState({
      currentRowData: Object.assign({}, row),
      editPkbModalVisible: true,
    });
  };

  handleEditPkbOk = (_) => {
    const { form } = this.editPkbFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ editModalLoading: true });
      editPkb(values, values.idKejadian)
        .then((response) => {
          form.resetFields();
          this.setState({
            editPkbModalVisible: false,
            editPkbModalLoading: false,
          });
          message.success("Berhasil diedit!");
          this.getPkb();
        })
        .catch((e) => {
          message.error("Pengeditan gagal, harap coba lagi!");
        });
    });
  };

  handleDeletePkb = (row) => {
    const { idKejadian } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => {
        deletePkb({ idKejadian }).then((res) => {
          message.success("Berhasil dihapus");
          this.getPkb();
        });
      },
    });
  };

  handleAddPkb = (row) => {
    this.setState({
      addPkbModalVisible: true,
    });
  };

  handleAddPkbOk = (_) => {
    const { form } = this.addPkbFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ addPkbModalLoading: true });
      addPkb(values)
        .then((response) => {
          form.resetFields();
          this.setState({
            addPkbModalVisible: false,
            addPkbModalLoading: false,
          });
          message.success("Berhasil menambahkan!");
          this.getPkb();
        })
        .catch((e) => {
          message.error("Gagal menambahkan, harap coba lagi!");
        });
    });
  };

  handleCancel = (_) => {
    this.setState({
      editPkbModalVisible: false,
      addPkbModalVisible: false,
    });
  };

  componentDidMount() {
    this.getPkb();

    reqUserInfo()
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengambil data user:", error);
      });
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
          idKejadian: row[columnMapping["ID Kejadian"]],
          tanggalPkb: this.convertToJSDate(row[columnMapping["Tanggal PKB"]]),
          lokasi: row[columnMapping["Lokasi"]],
          namaPeternak: row[columnMapping["Nama Peternak"]],
          idPeternak: row[columnMapping["ID Peternak"]],
          nikPeternak: row[columnMapping["NIK Peternak"]],
          idHewan: row[columnMapping["ID Hewan"]],
          spesies: row[columnMapping["Spesies"]],
          kategori: row[columnMapping["kategori"]],
          jumlah: row[columnMapping["Jumlah"]],
          umurKebuntingan: row[columnMapping["Umur Kebuntingan saat PKB (bulan)"]],
          pemeriksaKebuntingan: row[columnMapping["Pemeriksa Kebuntingan"]],
        };
        try {
          const isDataExists = await checkIfDataExists(dataToSave);
  
          if (!isDataExists) {
            // Lakukan pembaruan jika data sudah ada
            await addPkb(dataToSave);
          } else if (isDataExists) {
            isDataExists = true;
            await editPkb(dataToSave);
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
      this.getPkb();
    }
  };

  // Fungsi Export dari database ke file csv
  handleExportData = () => {
    const { pkb } = this.state;
    const csvContent = this.convertToCSV(pkb);
    this.downloadCSV(csvContent);
  };

  convertToCSV = (data) => {
    const columnTitles = [
      "ID Kejadian",
      "Tanggal PKB",
      "Lokasi",
      "Nama Peternak",
      "ID Peternak",
      "NIK Peternak",
      "ID Hewan",
      "Spesies",
      "Kategori",
      "Jumlah",
      "Umur Kebuntingan saat PKB (bulan)",
      "Pemeriksa Kebuntingan",
    ];

    const rows = [columnTitles];
    data.forEach((item) => {
      const row = [
        item.idKejadian,
        item.tanggalPkb,
        item.lokasi,
        item.namaPeternak,
        item.idPeternak,
        item.nikPeternak,
        item.idHewan,
        item.spesies,
        item.kategori,
        item.jumlah,
        item.umurKebuntingan,
        item.pemeriksaKebuntingan
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
    link.setAttribute("download", "Pkb.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
  };

  render(){
    const { pkb, importModalVisible, searchKeyword, user } = this.state;
    const columns = [
      { title: "ID Kejadian", dataIndex: "idKejadian", key: "idKejadian" },
      { title: "Tanggal PKB", dataIndex: "tanggalPkb", key: "tanggalPkb" },
      { title: "Lokasi", dataIndex: "lokasi", key: "lokasi" },
      { title: "Nama Peternak", dataIndex: ["idPeternak", "namaPeternak"], key: "namaPeternak" },
      { title: "ID Peternak", dataIndex: ["idPeternak", "idPeternak"], key: "idPeternak" },
      { title: "NIK Peternak", dataIndex: "nikPeternak", key: "nikPeternak" },
      { title: "ID Hewan", dataIndex: "idHewan", key: "idHewan" },
      { title: "Spesies", dataIndex: "spesies", key: "spesies" },
      { title: "Kategori", dataIndex: "kategori", key: "kategori" },
      { title: "Jumlah", dataIndex: "jumlah", key: "jumlah" },
      { title: "Umur Kebuntingan", dataIndex: "umurKebuntingan", key: "umurKebuntingan" },
      { title: "Pemeriksa Kebuntingan", dataIndex: "pemeriksaKebuntingan", key: "pemeriksaKebuntingan" }

    ];

    const renderTable = () => {
      if (user &&  user.role === 'ROLE_LECTURE') {
        return <Table dataSource={pkb} bordered columns={columns} />;
      } else if (user && user.role === 'ROLE_ADMINISTRATOR') {
        return <Table dataSource={pkb} bordered columns={(columns && renderColumns())}/>
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
              <Button type="primary" onClick={this.addPkb}>
                Tambah PKB
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
                onClick={() => this.handleEditPkb(row)}
              />
              <Divider type="vertical" />
              <Button
                type="primary"
                shape="circle"
                icon="delete"
                title="Delete"
                onClick={() => this.handleDeletePkb(row)}
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
    const cardContent = `Di sini, Anda dapat mengelola daftar pkb di sistem.`;
    return (
      <div className="app-container">
        {/* TypingCard component */}
        
        <TypingCard title="Manajemen Hewan" source={cardContent} />
        <br />

        <Card title={title} style={{ overflowX: "scroll" }}>
        {renderTable()}
        </Card>

        <EditPkbForm
          currentRowData={this.state.currentRowData}
          wrappedComponentRef={(formRef) =>
            (this.editPkbFormRef = formRef)
          }
          visible={this.state.editPkbModalVisible}
          confirmLoading={this.state.editPkbModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditPkbOk}
        />
        <AddPkbForm
          wrappedComponentRef={(formRef) =>
            (this.addPkbFormRef = formRef)
          }
          visible={this.state.addPkbModalVisible}
          confirmLoading={this.state.addPkbModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddPkbOk}
        />

        {/* Modal Import */}
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

export default Pkb;
