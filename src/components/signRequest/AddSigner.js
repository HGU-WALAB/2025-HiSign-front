import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { signerState } from '../../recoil/atom/signerState';
import { useNavigate } from 'react-router-dom';

const AddSigner = () => {
    const [signers, setSigners] = useRecoilState(signerState);
    const [name, setName] = useState('');
    const [emailPrefix, setEmailPrefix] = useState('');
    const [emailDomain, setEmailDomain] = useState('@handong.ac.kr');
    const navigate = useNavigate();

    const handleAddSigner = () => {
        if (name && emailPrefix) {
            const email = emailPrefix + emailDomain;
            const newSigner = { name, email };
            setSigners([...signers, newSigner]);
            setName('');
            setEmailPrefix('');
        } else {
            alert('Please enter both name and email.');
        }
    };

    const handleRemoveSigner = (index) => {
        const updatedSigners = signers.filter((_, i) => i !== index);
        setSigners(updatedSigners);
    };

    const handleNextStep = () => {
        if (signers.length > 0) {
            navigate('/align-sign');
        } else {
            alert('Please add at least one signer before proceeding.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>서명자 추가하기</h2>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginRight: '10px', padding: '12px', width: '45%', fontSize: '16px' }}
                />
                <div style={{ display: 'inline-flex', width: '45%' }}>
                    <input
                        type="text"
                        placeholder="Email"
                        value={emailPrefix}
                        onChange={(e) => setEmailPrefix(e.target.value)}
                        style={{ padding: '12px', width: '65%', fontSize: '16px', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                    <select
                        value={emailDomain}
                        onChange={(e) => setEmailDomain(e.target.value)}
                        style={{
                            padding: '12px',
                            width: '35%',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderLeft: 'none',
                            backgroundColor: '#f9f9f9',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="@handong.ac.kr">@handong.ac.kr</option>
                        <option value="@handong.edu">@handong.edu</option>
                    </select>
                </div>
            </div>
            <button onClick={handleAddSigner} style={{ padding: '12px 24px', backgroundColor: '#87CEEB', color: 'white', fontSize: '16px', border: 'none' }}>
                추가하기
            </button>

            <div style={{ marginTop: '30px' }}>
                <h3>Added Signers</h3>
                {signers.length === 0 ? (
                    <p>아직 서명자가 추가되지 않았습니다.</p>
                ) : (
                    signers.map((signer, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#f1f1f1',
                                padding: '15px',
                                marginBottom: '15px',
                                borderRadius: '8px',
                            }}
                        >
                            <div>
                                <strong>Signer {index + 1}</strong>
                                <p>Name: {signer.name}</p>
                                <p>Email: {signer.email}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveSigner(index)}
                                style={{
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={handleNextStep} disabled={signers.length === 0} style={{ padding: '12px 24px', backgroundColor: '#87CEEB', color: 'white', fontSize: '16px', border: 'none' }}>
                    다음 단계
                </button>
            </div>
        </div>
    );
};

export default AddSigner;