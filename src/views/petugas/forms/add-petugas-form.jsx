import React, { Component } from "react";
import { Form, Input, Modal, Select } from "antd";

class AddPetugasForm extends Component {
  render() {
    const { visible, onCancel, onOk, form, confirmLoading } = this.props;
    const { getFieldDecorator } = form;
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
        title="Tambah Data Petugas"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
        width={700}
      >
        <Form form={form} name="validateOnly" layout="vertical" autoComplete="off">
          <Form.Item label="NIK Petugas:">
            {getFieldDecorator("nikPetugas", {
                rules: [{ required: true, message: "Masukkan nik petugas!" }],
            }
            )(<Input placeholder="Masukkan nik petugas" />)}
          </Form.Item>
          <Form.Item label="Nama Petugas:">
            {getFieldDecorator("namaPetugas", {
              rules: [{ required: true, message: "Masukkan nama petugas!" }],
            })(<Input placeholder="Masukkan nama petugas" />)}
          </Form.Item>
          <Form.Item label="No Telepon Petugas:">
            {getFieldDecorator("noTelp", {
            })(<Input placeholder="Masukkan Telepon Petugas" />)}
          </Form.Item>
          <Form.Item label="Email Petugas:">
            {getFieldDecorator("email", {
            })(<Input placeholder="Masukkan Email Petugas" />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "AddPetugasForm" })(AddPetugasForm);
