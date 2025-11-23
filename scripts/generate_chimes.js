const fs = require('fs');
const path = require('path');
fs.mkdirSync(path.join(__dirname, '..', 'public', 'sfx'), { recursive: true });
function createWav(filePath, freq, duration=0.18, volume=0.6, sampleRate=44100) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const totalSamples = Math.floor(sampleRate * duration);
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * blockAlign;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bytesPerSample * 8, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  const data = Buffer.alloc(dataSize);
  for (let i=0;i<totalSamples;i++) {
    const t = i / sampleRate;
    const sample = Math.round(32767 * volume * Math.sin(2*Math.PI*freq*t) * Math.exp(-3*t));
    data.writeInt16LE(sample, i*2);
  }
  fs.writeFileSync(filePath, Buffer.concat([header, data]));
}
const out = (p)=>path.join(__dirname, '..', p);
createWav(out('public/sfx/combo_chime.wav'), 880, 0.18, 0.6);
createWav(out('public/sfx/achievement_unlock.wav'), 660, 0.25, 0.6);
console.log('Generated chimes');
