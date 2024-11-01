'use client';
import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { useRouter } from 'next/router';
import axios from 'axios';

const baseURL = new URL(process.env.NEXT_PUBLIC_HOST ?? 'http://localhost');

export default function Home() {
  const router = useRouter();
  const [key, setKey] = useState('querkode');
  const [format, setFormat] = useState('png');
  const [overlay, setOverlay] = useState('default');
  const [size, setSize] = useState(256);
  const [uppercase, setUppercase] = useState(false);
  const [destination, setDestination] = useState('http://localhost');
  const [destinationError, setDestinationError] = useState();

  const imageUrl = useMemo(() => {
    const url = new URL(`/api/qr/${encodeURIComponent(key)}`, baseURL);
    if (format) {
      url.searchParams.append('format', format);
    }
    if (overlay) {
      url.searchParams.append('overlay', overlay);
    }
    if (size && parseInt(size) >= 64) {
      url.searchParams.append('size', size);
    }
    if (uppercase) {
      url.searchParams.append('uppercase', uppercase);
    }
    console.log({ url: url.toString() });
    return url;
  }, [key, format, overlay, size, uppercase]);

  const onChangeKey = useCallback(
    (event) => {
      setKey(event.target.value);
    },
    [setKey],
  );
  const onChangeSize = useCallback(
    (event) => {
      setSize(event.target.value);
    },
    [setSize],
  );
  const onChangeFormat = useCallback(
    (event) => {
      setFormat(event.target.value);
    },
    [setFormat],
  );
  const onChangeOverlay = useCallback(
    (event) => {
      setOverlay(event.target.value);
    },
    [setOverlay],
  );
  const onChangeUppercase = useCallback(
    (event) => {
      setUppercase(!uppercase);
    },
    [setUppercase, uppercase],
  );
  const onChangeDestination = useCallback(
    (event) => {
      setDestination(event.target.value);
    },
    [setDestination],
  );
  const onCreateDestination = useCallback(async () => {
    const url = new URL(
      `/api/manage/create/${encodeURIComponent(key)}/${encodeURIComponent(destination)}`,
      baseURL,
    );
    try {
      setDestinationError('');
      await axios.get(url);
    } catch (error) {
      setDestinationError(error.message);
    }
  }, [destination, key, setDestinationError]);
  const onUpdateDestination = useCallback(async () => {
    const url = new URL(
      `/api/manage/update/${encodeURIComponent(key)}/${encodeURIComponent(destination)}`,
      baseURL,
    );
    try {
      setDestinationError('');
      await axios.get(url);
    } catch (error) {
      setDestinationError(error.message);
    }
  }, [destination, key, setDestinationError]);

  const image = useMemo(() => {
    return <img src={imageUrl.toString()} />;
  }, [imageUrl]);

  return (
    <div
      className={`grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20`}
    >
      <div className={`flex flex-row`}>
        <div className={`flex flex-col`}>
          <h1>QueRKode</h1>
          {image}
          <p>
            This UI is educational. It allows you to execute the api without
            curl
          </p>
        </div>
        <div className={`flex flex-col`}>
          <div className={`grid grid-rows`}>
            <div className={`row`}>
              <label
                className={`block text-gray-700 text-sm font-bold mb-2`}
                htmlFor="key"
              >
                Key
              </label>
              <input
                onChange={onChangeKey}
                value={key}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
            </div>
            <div className={`row`}>
              <label
                className={`block text-gray-700 text-sm font-bold mb-2`}
                htmlFor="size"
              >
                Size
              </label>
              <input
                onChange={onChangeSize}
                value={size}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
            </div>
            <div className={`row`}>
              <label
                className={`block text-gray-700 text-sm font-bold mb-2`}
                htmlFor="format"
              >
                Format
              </label>
              <div className={`inline-block relative w-64`}>
                <select
                  onChange={onChangeFormat}
                  value={format}
                  className={`block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline`}
                >
                  <option>png</option>
                  <option>jpeg</option>
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700`}
                >
                  <svg
                    className={`fill-current h-4 w-4`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className={`row`}>
              <label
                className={`block text-gray-700 text-sm font-bold mb-2`}
                htmlFor="overlay"
              >
                Overlay
              </label>
              <div className={`inline-block relative w-64`}>
                <select
                  onChange={onChangeOverlay}
                  value={overlay}
                  className={`block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline`}
                >
                  <option>default</option>
                  <option>transparent-x</option>
                  <option>transparent-o</option>
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700`}
                >
                  <svg
                    className={`fill-current h-4 w-4`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="row">
              <label
                className={`block text-gray-700 text-sm font-bold mb-2`}
                htmlFor="uppercase"
              >
                Uppercase
              </label>
              <div className={`inline-flex items-center`}>
                <label className={`flex items-center cursor-pointer relative`}>
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={onChangeUppercase}
                    className={`peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800`}
                  />
                  <span
                    className={`absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-3.5 w-3.5`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                </label>
              </div>
            </div>
            <div className="row" title=" (needs AUTH_NONE=YES set in .env)">
              <label
                className={`block text-gray-700 text-sm font-bold mb-2`}
                htmlFor="destination"
              >
                Destination
              </label>
              <input
                onChange={onChangeDestination}
                value={destination}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
              <button
                onClick={onCreateDestination}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              >
                Create
              </button>
              <button
                onClick={onUpdateDestination}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              >
                Update
              </button>
              <p>{destinationError}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
