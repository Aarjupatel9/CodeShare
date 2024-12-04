import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import toast from "react-hot-toast";
import AuctionService from '../services/auctionService';


export default function AuctionHome(props) {

  const { slug } = useParams();
  const navigate = useNavigate();

  const saveAndStartAuction = (data) => {
    AuctionService.createAuction(data).then((res) => {
      toast.success(res.message);
      if (res.result && res.result._id) {
        navigate("/t/auction/" + res.result._id);
      }
      console.log(res);
    }).catch((error) => {
      toast.error(error)
      console.log(error);
    });
  }

  const validateNewAuctionData = (data) => {
    if (!data) {
      return false;
    }
    if (!data.name || data.name.length < 2) {
      toast.error("name must be atleast 3 charactor");
      return false;
    }
    if (!data.organizer || data.organizer.length < 2) {
      toast.error("organizer name must be atleast 3 charactor");

      return false;
    }
    if (!data.password || data.password.length < 2) {
      toast.error("name must be atleast 3 charactor");
      return false;
    }
    return true;
  }
  const joinOngoingAuction = () => {
    let newTitle = "";
    toast.custom((t) => (
      <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
        <div
          className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
            }`}
        >
          Auction
        </div>
        <div className="flex flex-col items-start w-full space-y-2">
          <label htmlFor="newTitle" className="text-gray-700">
            Enter Auction Title
          </label>
          <input
            id="newTitle"
            type="text"
            placeholder="Auction title"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => (newTitle = e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-4 justify-center w-full">
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (newTitle.trim()) {
                console.log(`Renamed page to: ${newTitle}`);
                // if (validateNewAuctionTitle(newTitle)) {
                //   saveAndStartAuction(newTitle);
                //   toast.dismiss(t.id);
                // }
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create
          </button>
        </div>
      </div>
    ));
  }
  const createNewAuction = () => {
    let newTitle = "";
    let newPassword = "";
    let newBudget = "";
    let newOrganizer = "";
    toast.custom((t) => (
      <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
        <div
          className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
            }`}
        >
          Auction
        </div>
        <div className="flex flex-col items-start w-full space-y-2">
          <input
            id="newTitle"
            type="text"
            placeholder="Auction title"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => (newTitle = e.target.value)}
          />
          <input
            id="newOrganizer"
            type="text"
            placeholder="Auction organizer"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => (newOrganizer = e.target.value)}
          />
          <input
            id="newPassword"
            type="text"
            placeholder="Auction password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => (newPassword = e.target.value)}
          /> <input
            id="newBudget"
            type="number"
            placeholder="Per Team total budget"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => (newBudget = e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-4 justify-center w-full">
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (newTitle.trim()) {
                var data = {
                  name: newTitle.trim(),
                  organizer: newOrganizer.trim(),
                  password: newPassword.trim(),
                  budgetPerTeam: newBudget.trim()
                }
                console.log(`Creating action ${JSON.stringify(data)}`);

                if (validateNewAuctionData(data)) {
                  saveAndStartAuction(data);
                  toast.dismiss(t.id);
                }
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create
          </button>
        </div>
      </div>
    ), { duration: 4000000, });
  }
  return (
    <div className='flex flex-col  gap-3 mt-2'>
      <div className='button p-2 bg-gray-200 rounded cursor-pointer' onClick={() => { createNewAuction() }}>
        Start new auction
      </div>

      <div className='button p-2 bg-gray-200 rounded cursor-pointer' onClick={() => { joinOngoingAuction() }}>
        Continue ongoing auction
      </div>

    </div>
  )
}
