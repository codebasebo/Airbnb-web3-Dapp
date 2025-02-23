import { useState } from 'react'
import { useAirbnb } from '../../hooks/useAirbnb'
import { UploadDropzone } from "@bytescale/upload-widget-react";
import Web3 from 'web3'

const NewListingForm = ({ setShowNewListingModal }) => {
  const [name, setName] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [description, setDescription] = useState('')
  const [imgURL, setImgURL] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const { addListing } = useAirbnb()

  const options = {
    apiKey: "public_kW2K8Dm6kkN8HLsLs21qKAzF7bc2", // This is your API key.
    maxFileCount: 1,
    showFinishButton: true,
    styles: {
      colors: {
        primary: "#377dff"
      }
    }
  };

  const onCreate = async (event) => {
    event.preventDefault()
    const priceInWei = Web3.utils.toWei(pricePerDay, 'ether')
    
    try {
      // Call the addListing function
      await addListing(name, propertyAddress, description, imgURL, priceInWei)
      
      // Reload the page after successful creation
      window.location.reload()
    } catch (error) {
      console.error("Error creating listing:", error)
      alert("Failed to create listing. Please try again.")
    }
  }

  const styles = {
    wrapper: `mt-2 p-6 bg-white rounded-lg shadow-md`,
    formWrapper: `grid grid-cols-1 gap-4`,
    formInputContainer: `flex flex-col border rounded-lg px-4 py-3 bg-gray-50`,
    inputLabel: `text-sm font-medium text-gray-700`,
    input: `outline-none bg-transparent text-sm pt-1 text-gray-900`,
    uploadContainer: `flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-gray-50`,
    uploadText: `text-sm text-gray-600 mt-2`,
    buttonContainer: `mt-6 flex justify-end`,
    createButton: `bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700 transition-colors duration-200`,
    createButtonDisabled: `bg-blue-300 text-white rounded-lg px-6 py-2 text-sm font-medium cursor-not-allowed`,
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.formWrapper}>
        <label className={styles.formInputContainer}>
          <span className={styles.inputLabel}>Name</span>
          <input
            onChange={event => setName(event.target.value)}
            value={name}
            className={styles.input}
            placeholder="Enter property name"
          />
        </label>
        <label className={styles.formInputContainer}>
          <span className={styles.inputLabel}>Address</span>
          <input
            onChange={event => setPropertyAddress(event.target.value)}
            value={propertyAddress}
            className={styles.input}
            placeholder="Enter property address"
          />
        </label>
        <label className={styles.formInputContainer}>
          <span className={styles.inputLabel}>Description</span>
          <input
            onChange={event => setDescription(event.target.value)}
            value={description}
            className={styles.input}
            placeholder="Enter property description"
          />
        </label>
        <div className={styles.uploadContainer}>
          <UploadDropzone
            options={options}
            onUpdate={({ uploadedFiles }) => setImgURL(uploadedFiles.map(x => x.fileUrl).join("\n"))}
            onComplete={files => alert(files.map(x => x.fileUrl).join("\n"))}
            width="100%"
            height="200px"
          />
          <span className={styles.uploadText}>Upload property image</span>
        </div>
        <label className={styles.formInputContainer}>
          <span className={styles.inputLabel}>Price per Day (ETH)</span>
          <input
            onChange={event => setPricePerDay(event.target.value)}
            value={pricePerDay}
            className={styles.input}
            placeholder="Enter price per day in ETH"
          />
        </label>
      </div>
      <div className={styles.buttonContainer}>
        <button
          onClick={onCreate}
          disabled={
            !name || !propertyAddress || !description || !imgURL || !pricePerDay
          }
          type='button'
          className={
            !name || !propertyAddress || !description || !imgURL || !pricePerDay
              ? styles.createButtonDisabled
              : styles.createButton
          }
        >
          Create
        </button>
      </div>
    </div>
  )
}

export default NewListingForm