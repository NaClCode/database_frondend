import React, { useState, useEffect } from "react";
import "./user.scss";
import { Descriptions, Button, Modal, Form, Input, message, Select, Spin } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { service } from "@/service";

const User = () => {
  const [user, setUser] = useState({});
  const [userType, setUserType] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false); // 加载状态
  const [saving, setSaving] = useState(false); // 更新信息按钮加载状态
  const [form] = Form.useForm();

  const formatGender = (gender) => {
    switch (gender) {
      case "M":
        return "男生";
      case "F":
        return "女生";
      case "U":
      default:
        return "未设置";
    }
  };

  useEffect(() => {
    const userTypeFromStorage = localStorage.getItem("userType");
    setUserType(userTypeFromStorage);

    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        if (userTypeFromStorage === "teacher") {
          const res = await service.teacher.getInfo();
          setUser(res.data.data);
        } else if (userTypeFromStorage === "student") {
          const res = await service.student.getInfo();
          setUser(res.data.data);
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        message.error("无法获取用户信息，请检查您的网络连接或稍后重试！");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setIsModalVisible(true);
    form.setFieldsValue(user);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const processedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value ?? ""])
      );

      const updateUserInfo = async () => {
        setSaving(true);
        try {
          if (userType === "teacher") {
            await service.teacher.updateInfo(
              processedValues.username,
              processedValues.password,
              processedValues.sex,
              processedValues.introduction,
              processedValues.profession,
              processedValues.college,
              processedValues.idcard
            );
            message.success("教师信息已更新！");
          } else if (userType === "student") {
            await service.student.updateInfo(
              processedValues.username,
              processedValues.password,
              processedValues.sex,
              processedValues.classer,
              processedValues.profession,
              processedValues.college,
              processedValues.idcard
            );
            message.success("学生信息已更新！");
          }
          setUser((prevUser) => ({ ...prevUser, ...processedValues }));
          setIsModalVisible(false);
        } catch (error) {
          console.error("更新信息失败:", error);
          message.error("更新失败，无法连接服务器，请稍后再试！");
        } finally {
          setSaving(false);
        }
      };

      updateUserInfo();
    }).catch((errorInfo) => {
      console.error("表单验证失败:", errorInfo);
    });
  };

  return (
    <div className="user">
       <Spin spinning={loading} tip="加载中..."></Spin>
      <div className="user-box">  
        <h1 className="title">
          <UserOutlined /> &nbsp;个人信息
        </h1>
        <p className="description">查看和更新您的个人信息</p>
        <hr className="divide" />
        <Descriptions column={1} bordered>
          <Descriptions.Item label="用户类型" className="item">
            {userType === "teacher" ? "教师" : "学生"}
          </Descriptions.Item>
          <Descriptions.Item label="姓名" className="item">
            {user.name || "未设置"}
          </Descriptions.Item>
          <Descriptions.Item label="性别" className="item">
            {formatGender(user.sex)}
          </Descriptions.Item>
          {userType === "teacher" ? (
            <>
              <Descriptions.Item label="简介" className="item">
                {user.introduction || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="专业" className="item">
                {user.profession || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="学院" className="item">
                {user.college || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="电子邮件" className="item">
                {user.email || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="身份证号" className="item">
                {user.idcard || "未设置"}
              </Descriptions.Item>
            </>
          ) : (
            <>
              <Descriptions.Item label="班级" className="item">
                {user.classer || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="专业" className="item">
                {user.profession || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="学院" className="item">
                {user.college || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="电子邮件" className="item">
                {user.email || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="身份证号" className="item">
                {user.idcard || "未设置"}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
        <Button
          type="primary"
          icon={<EditOutlined />}
          className="button"
          onClick={handleEdit}
        >
          更新信息
        </Button>
      </div>

      <Modal
        title="更新个人信息"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="username">
            <Input />
          </Form.Item>
          <Form.Item label="性别" name="sex" >
            <Select placeholder="请选择性别">
              <Select.Option value="M">男生</Select.Option>
              <Select.Option value="F">女生</Select.Option>
              <Select.Option value="U">未知</Select.Option>
            </Select>
          </Form.Item>
          {userType === "teacher" && (
            <Form.Item label="简介" name="introduction">
              <Input />
            </Form.Item>
          )}
          <Form.Item label="专业" name="profession">
            <Input />
          </Form.Item>
          <Form.Item label="学院" name="college">
            <Input />
          </Form.Item>
          {userType === "student" && (
            <Form.Item label="班级" name="classer">
              <Input />
            </Form.Item>
          )}
          <Form.Item label="身份证号" name="idcard">
            <Input />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { min: 6, message: "密码长度不能少于6位" },
            ]}
          >
            <Input.Password placeholder="输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default User;
