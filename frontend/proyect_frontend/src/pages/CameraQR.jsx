import React from "react";
//import { AddBarrel } from "../components/ButtonQR2";
import { AddBarrel } from "../components/AddBarrel/AddBarrel";
import { FaCamera } from "react-icons/fa";

export default function CameraQR() {
  return <AddBarrel icon={<FaCamera />} />;
}
