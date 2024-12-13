import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Custom hook to manage app configuration using AsyncStorage.
 *
 * @param {string} configKey - The key used to store/retrieve the configuration in AsyncStorage.
 * @param {T} defaultValue - The default value to be used if no value is found in AsyncStorage.
 * @returns {Array} - An array containing the current config and a setter function to update it.
 */

const useAppConfig = <T extends object | string | number | boolean>(
  configKey: string,
  defaultValue: T
): [T, (newConfig: T | ((prevState: T) => T)) => void] => {
  const [config, setConfig] = useState<T>(defaultValue);

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        const storedConfig = await AsyncStorage.getItem(configKey);
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          if (
            isMounted &&
            JSON.stringify(parsedConfig) !== JSON.stringify(config)
          ) {
            setConfig(parsedConfig);
          }
        } else if (isMounted) {
          setConfig(defaultValue);
        }
      } catch (error) {
        console.error(`Failed to load config for ${configKey}:`, error);
        if (isMounted) {
          setConfig(defaultValue);
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [configKey]);

  const saveConfig = useCallback(
    async (newConfig: T | ((prevState: T) => T)) => {
      try {
        const configToSave =
          typeof newConfig === "function"
            ? (newConfig as (prevState: T) => T)(config)
            : newConfig;

        if (configToSave !== undefined) {
          await AsyncStorage.setItem(configKey, JSON.stringify(configToSave));
          setConfig(configToSave);
        }
      } catch (error) {
        console.error(`Failed to save config for ${configKey}:`, error);
      }
    },
    [configKey, config]
  );

  return [config, saveConfig];
};

export default useAppConfig;
