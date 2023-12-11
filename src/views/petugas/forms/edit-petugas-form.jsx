import React, { Component } from "react";
import { Form, Input, Modal, Select, Space, Button } from "antd";

class EditPetugasForm extends Component {
  render() {
    const { visible, onCancel, onOk, form, confirmLoading, currentRowData } =
      this.props;
    const { getFieldDecorator } = form;
    const {
      nikPetugas,
      namaPetugas,
      noTelp,
      email,
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
        title="Edit Data Petugas"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
        width={700}
      >
        <Form form={form} name="validateOnly" layout="vertical" autoComplete="off">
            <Form.Item label="NIK Petugas">
                {getFieldDecorator("nikPetugas", {
                initialValue: nikPetugas,
                })(<Input placeholder="Masukkan NIK Petugas!" />)}
            </Form.Item>
            <Form.Item label="Nama Petugas">
                {getFieldDecorator("namaPetugas", {
                initialValue: namaPetugas,
                })(<Input placeholder="Masukkan Nama Petugas!" />)}
            </Form.Item>
            <Form.Item label="No. Telepon Petugas">
                {getFieldDecorator("noTelp", {
                initialValue: noTelp,
                })(<Input placeholder="Masukkan No Telepon Petugas!" />)}
            </Form.Item>
            <Form.Item label="Email Petugas">
                {getFieldDecorator("email", {
                initialValue: email,
                })(<Input placeholder="Masukkan Email Petugas!" />)}
            </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "EditPetugasForm" })(EditPetugasForm);
