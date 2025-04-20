import React, { useEffect, useState } from "react";
import "../styles/Connection.css";

const Connection = ({ connection, nodes, isActive }) => {
	const [fromCenter, setFromCenter] = useState({ x: 0, y: 0 });
	const [toCenter, setToCenter] = useState({ x: 0, y: 0 });

	const fromNode = nodes.find((node) => node.id === connection.from);
	const toNode = nodes.find((node) => node.id === connection.to);

	if (!fromNode || !toNode) {
		return null;
	}

	const fromX = fromNode.x + 75;
	const fromY = fromNode.y + 50;
	const toX = toNode.x + 75;
	const toY = toNode.y + 50;

	const isFromChecked = !!fromNode.checked;
	const isToChecked = !!toNode.checked;

	const midX = (fromX + toX) / 2;
	const midY = (fromY + toY) / 2;

	const dx = toX - fromX;
	const dy = toY - fromY;
	const distance = Math.sqrt(dx * dx + dy * dy);

	const curveOffset = Math.min(distance * 0.2, 50);

	const angle = Math.atan2(dy, dx);
	const perpAngle = angle + Math.PI / 2;

	const cpX = midX + Math.cos(perpAngle) * curveOffset;
	const cpY = midY + Math.sin(perpAngle) * curveOffset;

	let strokeColor = "#555";
	let strokeOpacity = 1;

	if (isFromChecked && isToChecked) {
		strokeColor = "#12b886";
		strokeOpacity = 0.7;
	} else if (isFromChecked || isToChecked) {
		strokeColor = "#adb5bd";
		strokeOpacity = 0.8;
	}

	return (
		<>
			<line className="connection-line-base" x1={fromX} y1={fromY} x2={toX} y2={toY} stroke={strokeColor} strokeOpacity={0.3} strokeWidth="1" />

			<path className={`connection-path ${isActive ? "active" : ""}`} d={`M ${fromX} ${fromY} Q ${cpX} ${cpY} ${toX} ${toY}`} stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="2" fill="none" />

			<polygon className="connection-arrow" points="0,-5 10,0 0,5" transform={`translate(${toX},${toY}) rotate(${(angle * 180) / Math.PI})`} fill={strokeColor} fillOpacity={strokeOpacity} />
		</>
	);
};

export default Connection;
