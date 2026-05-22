import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {WaButton} from "@web.awesome.me/webawesome-pro/dist/react";
import Header from "./Header";

const Dashboard = () => {
	const navigate = useNavigate();
	return (
		<div className="page">
			<Header
				activePage="dashboard"
				title="Dashboard"
			/>
			<div className="page-content">
				<p>This page is under construction.</p>
				<WaButton
					onClick={() => navigate("/sleep")}
					pill
				>
					Go to Sleep Page
				</WaButton>
			</div>
		</div>
	);
};

export default Dashboard;
