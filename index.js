const SSM = require('./repository/ssm');

/**
 * Private function for loading environment variables with custom configuration options.
 * @param {*} opt 
 */
const loadEnv = async (opt) => {
    const options = {
        parameterBasePath: opt.parameterBasePath || process.env.PARAM_PATH,
        region: opt.region || process.env.AWS_REGION
    };

    const result = await new SSM(options).init();
    SSM.loadParametersToEnv(result, options.parameterBasePath);
};

module.exports = {
    load: async (options = {}) => {
        let isLoaded = false;

        const {
            PARAM_PATH = null,
            DEPLOYED_AT,
            PARAM_LOADED_AT = null,
            ECS_CONTAINER_METADATA_FILE = null, // Predefined AWS environment variable for ECS service
            AWS_LAMBDA_FUNCTION_NAME = null, // Predefined AWS environment variable for Lambda
        } = process.env;

        // Locally we don't set this PARAM_PATH variable, this set using Cloudformation template 
        if (PARAM_PATH !== null) { 
            // For ECS Services
            if (ECS_CONTAINER_METADATA_FILE !== null) {
                await loadEnv(options);
                isLoaded = true;
            }
            
            // For Lambda
            if (AWS_LAMBDA_FUNCTION_NAME !== null && PARAM_LOADED_AT !== DEPLOYED_AT) {
                await loadEnv(options);
                process.env.PARAM_LOADED_AT = DEPLOYED_AT;
                isLoaded = true;
            }
        }

        return isLoaded;
    }
};