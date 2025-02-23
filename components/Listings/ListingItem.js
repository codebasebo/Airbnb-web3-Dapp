import Image from 'next/image'
import { useState } from 'react'
import Web3 from 'web3'
import { StarIcon } from '@heroicons/react/20/solid'
import { HeartIcon } from '@heroicons/react/24/outline'
import { useAccount } from 'wagmi'
import { useAppContext } from '../../context/context'
import { useAirbnb } from '../../hooks/useAirbnb'

const ListingItem = ({ item, setShowReserveListingModal }) => {
  const [priceInEth] = useState(Web3.utils.fromWei(item.pricePerDay))

  const { address } = useAccount()

  const { setSelectedPropertyId } = useAppContext()

  return (
    <div
      className='flex flex-col space-y-3 cursor-pointer max-w-[20rem] w-full'
      onClick={event => {
        event.preventDefault()
        if (item.isBooked) return
        setShowReserveListingModal(true)
        setSelectedPropertyId(item.id)
      }}
    >
      {/* Image Container */}
      <div className='relative h-[20rem] w-full rounded-xl overflow-hidden group'>
        <Image
          src={item.imgUrl}
          alt={item.name}
          layout='fill'
          objectFit='cover'
          className='transition-transform duration-300 group-hover:scale-105'
        />

        {/* Heart Icon */}
        {address && (
          <div className='transition-all duration-150 absolute top-4 right-4'>
            <HeartIcon
              className={`w-6 h-6 text-white ${
                item.isBooked ? 'fill-red-500' : 'opacity-80'
              }`}
            />
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className='flex flex-col space-y-2'>
        {/* Name and Rating */}
        <div className='flex justify-between items-center'>
          <h3 className='font-medium text-lg'>{item.name}</h3>
          <div className='flex items-center space-x-1'>
            <StarIcon className='h-4 w-4 text-yellow-400' />
            <p className='text-sm text-gray-800'>{4.8}</p>
          </div>
        </div>

        {/* Address */}
        <p className='text-sm font-light text-gray-600'>{item.address}</p>

        {/* Price or Unavailable Message */}
        {item.isBooked ? (
          <p className='text-sm font-medium text-red-500'>Property Unavailable</p>
        ) : (
          <p className='text-sm font-light text-gray-800'>
            <span className='text-base font-medium'>
              ETH {priceInEth.toLocaleString('en-US')}
            </span>
            &nbsp;per night
          </p>
        )}
      </div>
    </div>
  )
}

export default ListingItem