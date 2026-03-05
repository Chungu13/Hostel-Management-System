import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodePassProps {
    value: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
    level?: "L" | "M" | "Q" | "H";
}

const QRCodePass: React.FC<QRCodePassProps> = ({
    value,
    size = 200,
    className = "rounded-lg",
    style,
    level = "H"
}) => {
    return (
        <QRCodeSVG
            value={value}
            size={size}
            level={level}
            includeMargin={true}
            className={className}
            style={style}
        />
    );
};

export default QRCodePass;
