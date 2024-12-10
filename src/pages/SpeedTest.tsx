import React from 'react';
import Speedometer from '../components/Speedometer';

const SpeedTest: React.FC = () => {
  const [downloadSpeed, setDownloadSpeed] = React.useState(0);
  const [uploadSpeed, setUploadSpeed] = React.useState(0);

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Compare Internet Speeds</h1>
          <p className="text-gray-500">
            Test your current internet speed and compare it with what you're paying for
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Download Speed</h2>
            <Speedometer 
              type="download" 
              value={downloadSpeed}
              onChange={setDownloadSpeed}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Upload Speed</h2>
            <Speedometer 
              type="upload" 
              value={uploadSpeed}
              onChange={setUploadSpeed}
            />
          </div>
        </div>

        <div className="bg-card/50 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Speed Test Results</h2>
          <div className="grid gap-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-black/5">
              <span className="text-gray-500">Download Speed</span>
              <span className="font-medium">{downloadSpeed.toFixed(1)} Mbps</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-black/5">
              <span className="text-gray-500">Upload Speed</span>
              <span className="font-medium">{uploadSpeed.toFixed(1)} Mbps</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-black/5">
              <span className="text-gray-500">Latency</span>
              <span className="font-medium">-- ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedTest;
