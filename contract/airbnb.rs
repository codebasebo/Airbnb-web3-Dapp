use stylus_sdk::{
    alloy_primitives::Address,
    prelude::*,
    storage::StorageMap,
};

sol! {
     event PropertyListedEvent(
        string name,
        string propertyAddress,
        string description,
        string imgUrl,
        uint256 pricePerDay,
        uint256 id
    );
    event PropertyBookedEvent(
        uint256 id,
        address guest,
        uint256 numberOfDays,
        uint256 price
    );
}
    

sol_storage! {
    #[entrypoint]
pub  struct PropertyInfo {
        address owner;
        address guest;
        string name;
        string propertyAddress;
        string description;
        string imgUrl;
        uint256 bookingStartsAt;
        uint256 bookingEndsAt;
        uint256 pricePerDay;
        uint256 id;
        bool isBooked;
}

pub struct Airbnb {
    address public owner;
    uint256 public counter;
    uint256[] public rentalIds;
     mapping(uint256 => PropertyInfo) public properties;
    }
}

#[external]
impl Airbnb {
    pub fn constructor(&mut self) {
        self.owner = msg::sender();
        self.counter = U256::zero();
    }

    pub fn list_property(
        &mut self,
        name: String,
        property_address: String,
        description: String,
        img_url: String,
        price_per_day: U256,
    ) {
        let counter = self.counter;
        
        let new_property = PropertyInfo {
            owner: msg::sender(),
            guest: Address::ZERO,
            name: name.clone(),
            property_address: property_address.clone(),
            description: description.clone(),
            img_url: img_url.clone(),
            booking_starts_at: 0,
            booking_ends_at: 0,
            price_per_day,
            id: counter,
            is_booked: false,
        };

        self.properties.insert(counter, new_property);
        self.rental_ids.push(counter);

        // Emit event
        PropertyListedEvent(
            name,
            property_address,
            description,
            img_url,
            price_per_day,
            counter
        ).emit();

        self.counter += U256::from(1);
    }

    pub fn get_due_price(&self, id: U256, start_date: u64, end_date: u64) -> U256 {
        let property = self.properties.get(&id).expect("Property not found");
        let number_of_days = (end_date - start_date) / 86400;
        property.price_per_day * U256::from(number_of_days)
    }

    pub fn book_property(&mut self, property_id: U256, start_date: u64, end_date: u64) {
        let property = self.properties.get_mut(&property_id).expect("Property not found");
        let number_of_days = (end_date - start_date) / 86400;
        let required_payment = property.price_per_day * U256::from(number_of_days);

        assert!(msg::value() >= required_payment, "Send more ETH");

        // Transfer payment to property owner
        property.owner.transfer(msg::value());

        // Update property booking details
        property.is_booked = true;
        property.booking_starts_at = start_date;
        property.booking_ends_at = end_date;
        property.guest = msg::sender();

        // Emit event
        PropertyBookedEvent(
            property_id,
            msg::sender(),
            number_of_days,
            msg::value()
        ).emit();
    }

    pub fn unbook_property(&mut self, property_id: U256) {
        let property = self.properties.get_mut(&property_id).expect("Property not found");

        assert!(property.owner == msg::sender(), "Only the Property Owner can unbook the property");
        assert!(property.is_booked, "Property is not booked");

        property.is_booked = false;
    }
}
