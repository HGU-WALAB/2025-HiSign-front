

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

import HisnetLoginButton from "../components/HisnetLoginButton";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import { Fab } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';


import thum3 from "../asset/signperson.png";
import thum4 from "../asset/main.png";


function SideBar() {
    const loginMember = useRecoilValue(loginMemberState);

    useEffect(() => {
        console.log("loginMember", loginMember);
    }, [loginMember]);

    return (
        <PageContainer>
            <CenterContainer>
                <ImageContainer>
                    <StyledImage src={thum4} alt="썸네일4" />
                    <StyledImage src={thum3} alt="썸네일3" />
                </ImageContainer>


                <MainTitle>Hi-Sign</MainTitle>

                 {!!loginMember.uniqueId ? (
                    <CenterLink to="/tasksetup">서명 요청</CenterLink>

                ) : (
                    <HisnetLoginButton>히즈넷으로 로그인</HisnetLoginButton>
                )}
            </CenterContainer>
        </PageContainer>
    );
}

export default SideBar;

// ==========================
// Styled Components
// ==========================

const PageContainer = styled.div`
    min-height: 100vh;
    padding: 20px 20px 60px 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
`;

const CenterContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
    width: 100%;
    max-width: 800px;
    margin-top: 40px;
`;

const ImageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap; 
    overflow-x: hidden; 
`;

const StyledImage = styled.img`
    width: 45%; 
    height: auto;
    flex-shrink: 0; 

    @media (max-width: 768px) {
        width: 80%;
    }
`;


const MainTitle = styled.h1`
    font-size: 2.5rem;
    margin-top: 20px;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const CenterLink = styled(Link)`
    margin-top: 20px;
    background-color: #87CEFA;
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease-in-out;
    text-decoration: none;

    &:hover {
        background-color: #4682B4;
    }

    @media (max-width: 768px) {
        padding: 12px 24px;
        font-size: 16px;
    }
`;
