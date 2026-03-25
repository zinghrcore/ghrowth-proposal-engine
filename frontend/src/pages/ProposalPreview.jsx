import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_URL;

const ProposalPreview = () => {
  const [proposal, setProposal] = useState(null);
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get("id");

  useEffect(() => {
    if (proposalId) {
      fetch(`${BASE_URL}/api/proposals/${proposalId}`)
        .then((res) => res.json())
        .then((data) => setProposal(data))
        .catch((err) => console.error(err));
    }
  }, [proposalId]);

  if (!proposal) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1 style={{ color: "#2e7d32" }}>ZingHR Proposal</h1>
      <h3>Client: {proposal.clientName}</h3>
      <h4>Company: {proposal.companyName}</h4>
      <p>Plan: {proposal.planName}</p>
      <p>Industry: {proposal.industry}</p>
      <p>Billing Frequency: {proposal.billingFreq}</p>
      <p>Modules Opted: {proposal.modulesOpted?.join(", ")}</p>
      <hr style={{ margin: "20px 0" }} />
      <p>Date: {proposal.propDate}</p>
      <p>Signature: {proposal.custSignName}</p>
    </div>
  );
};

export default ProposalPreview;
