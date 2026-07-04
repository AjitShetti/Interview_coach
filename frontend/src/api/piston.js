import axios from 'axios';

const PISTON_VERSIONS = {
  python: '3.10.0',
  javascript: '18.15.0'
};

export const executeCode = async (language, code) => {
  try {
    const version = PISTON_VERSIONS[language];
    if (!version) {
      throw new Error(`Language ${language} is not supported by Piston setup.`);
    }

    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: language,
      version: version,
      files: [
        {
          content: code
        }
      ]
    });

    if (response.data.compile && response.data.compile.code !== 0) {
      return response.data.compile.output;
    }

    return response.data.run.output;
  } catch (error) {
    console.error("Error executing code via Piston:", error);
    throw new Error(error.response?.data?.message || 'Failed to execute code');
  }
};
