import React, { useState } from "react";
import { Upload, Download, Coins, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const CertificateGenerator = () => {
  const [formData, setFormData] = useState({
    name: "",
    activity: "",
    date: "",
    recipientWallet: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("generate");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateCertificate = async () => {
    if (!formData.name || !formData.activity || !formData.date) {
      setError("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/certificate/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.certificate);
      } else {
        setError(data.error || "Gagal generate sertifikat");
      }
    } catch (err) {
      setError("Error koneksi ke server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAndMintNFT = async () => {
    if (!formData.name || !formData.activity || !formData.date || !formData.recipientWallet) {
      setError("Mohon lengkapi semua field termasuk alamat wallet");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/certificate/generate-and-mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.certificate);
      } else {
        setError(data.error || "Gagal generate dan mint NFT");
      }
    } catch (err) {
      setError("Error koneksi ke server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      activity: "",
      date: "",
      recipientWallet: "",
    });
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Platform Sertifikat Digital NFT</h1>
          <p className="text-xl text-blue-200">Berbasis Blockchain Solana - Universitas Yudharta Pasuruan</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-1">
            <button onClick={() => setActiveTab("generate")} className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === "generate" ? "bg-white text-purple-900 shadow-lg" : "text-white hover:bg-white/20"}`}>
              <Upload className="inline-block w-5 h-5 mr-2" />
              Generate Sertifikat
            </button>
            <button onClick={() => setActiveTab("mint")} className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === "mint" ? "bg-white text-purple-900 shadow-lg" : "text-white hover:bg-white/20"}`}>
              <Coins className="inline-block w-5 h-5 mr-2" />
              Generate & Mint NFT
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">{activeTab === "generate" ? "Data Sertifikat" : "Data Sertifikat & NFT"}</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Nama Penerima *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Nama Kegiatan *</label>
                  <input
                    type="text"
                    name="activity"
                    value={formData.activity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Contoh: Seminar Blockchain Technology"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Tanggal Kegiatan *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                {activeTab === "mint" && (
                  <div>
                    <label className="block text-white font-medium mb-2">Alamat Wallet Solana *</label>
                    <input
                      type="text"
                      name="recipientWallet"
                      value={formData.recipientWallet}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Contoh: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center space-x-2 text-red-300 bg-red-500/20 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={activeTab === "generate" ? generateCertificate : generateAndMintNFT}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" /> : activeTab === "generate" ? <Upload className="inline-block w-5 h-5 mr-2" /> : <Coins className="inline-block w-5 h-5 mr-2" />}
                    {loading ? "Processing..." : activeTab === "generate" ? "Generate Sertifikat" : "Generate & Mint NFT"}
                  </button>

                  <button onClick={resetForm} className="bg-white/20 text-white font-medium py-3 px-6 rounded-lg hover:bg-white/30 transition-all duration-200">
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Hasil</h2>

              {!result && !loading && (
                <div className="text-center text-white/70 py-12">
                  <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Sertifikat akan muncul di sini setelah di-generate</p>
                </div>
              )}

              {loading && (
                <div className="text-center text-white py-12">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
                  <p>{activeTab === "generate" ? "Generating sertifikat..." : "Generating sertifikat dan minting NFT..."}</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-300">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">{activeTab === "generate" ? "Sertifikat berhasil di-generate!" : "NFT berhasil di-mint!"}</span>
                    </div>
                  </div>

                  {/* Certificate Preview */}
                  <div>
                    <h3 className="text-white font-medium mb-3">Preview Sertifikat:</h3>
                    <div className="bg-white rounded-lg p-2">
                      <img src={result.imageUrl} alt="Certificate" className="w-full rounded border" />
                    </div>
                  </div>

                  {/* Download Button */}
                  <a href={result.imageUrl} download={`certificate_${result.id}.png`} className="flex items-center justify-center space-x-2 bg-green-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="w-5 h-5" />
                    <span>Download Sertifikat</span>
                  </a>

                  {/* NFT Information */}
                  {result.nft && (
                    <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-3">Informasi NFT:</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-purple-300">Mint Address:</span>
                          <span className="text-white font-mono text-xs break-all">{result.nft.mintAddress}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-purple-300">Transaction:</span>
                          <a href={`https://explorer.solana.com/tx/${result.nft.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 font-mono text-xs break-all">
                            {result.nft.signature}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Certificate ID */}
                  <div className="text-center">
                    <p className="text-white/70 text-sm">
                      Certificate ID: <span className="font-mono">{result.id}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Terverifikasi</h3>
            <p className="text-white/70">Setiap sertifikat tersimpan permanen di blockchain Solana</p>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <Coins className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">NFT Certificate</h3>
            <p className="text-white/70">Sertifikat dalam bentuk NFT yang dapat disimpan dalam wallet</p>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <Download className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Download</h3>
            <p className="text-white/70">Download sertifikat dalam format PNG berkualitas tinggi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
