use stylus_sdk::{
    alloy_primitives::Address,
    prelude::*,
    storage::StorageMap,
};

#[derive(Debug)]
pub struct PropertyInfo {
    owner: Address,
    guest: Address,
    name: String,
    property_address: String,
    description: String,
    img_url: String,
    booking_starts_at: u64,
    booking_ends_at: u64,
    price_per_day: u256,
    id: u256,
    is_booked: bool,
}

#[derive(Debug)]
pub struct Airbnb {
    owner: StorageMap<(), Address>,
    counter: StorageMap<(), u256>,
    rental_ids: StorageMap<u256, u256>,
    properties: StorageMap<u256, PropertyInfo>,
}

#[external]
impl Airbnb {
    pub fn constructor(&mut self) {
        self.owner.insert((), msg::sender());
        self.counter.insert((), 0.into());
    }

    pub fn list_property(
        &mut self,
        name: String,
        property_address: String,
        description: String,
        img_url: String,
        price_per_day: u256,
    ) {
        let counter = self.counter.get(&()).unwrap_or_default();
        
        let new_property = PropertyInfo {
            owner: msg::sender(),
            guest: Address::ZERO,
            name,
            property_address,
            description,
            img_url,
            booking_starts_at: 0,
            booking_ends_at: 0,
            price_per_day,
            id: counter,
            is_booked: false,
        };

        self.properties.insert(counter, new_property);
        self.rental_ids.insert(counter, counter);

        // Emit event
        evm::log::log2(
            &[],
            &solidity::encode_event_data(&(
                name,
                property_address,
                description,
                img_url,
                price_per_day,
                counter
            )),
            solidity::encode_event_sig("PropertyListedEvent(string,string,string,string,uint256,uint256)"),
            msg::sender().into(),
        );

        self.counter.insert((), counter + 1.into());
    }

    pub fn get_due_price(
        &self,
        id: u256,
        start_date: u64,
        end_date: u64,
    ) -> u256 {
        let property = self.properties.get(&id).expect("Property not found");
        let number_of_days = (end_date - start_date) / 86400000;
        property.price_per_day * number_of_days.into()
    }

    pub fn book_property(
        &mut self,
        property_id: u256,
        start_date: u64,
        end_date: u64,
    ) {
        let property = self.properties.get_mut(&property_id).expect("Property not found");
        let number_of_days = (end_date - start_date) / 86400000;
        let required_payment = property.price_per_day * number_of_days.into();

        require(
            msg::value() >= required_payment,
            "Send more ETH"
        );

        // Transfer payment to property owner
        property.owner.transfer(msg::value());

        // Update property booking details
        property.is_booked = true;
        property.booking_starts_at = start_date;
        property.booking_ends_at = end_date;
        property.guest = msg::sender();

        // Emit event
        evm::log::log2(
            &[],
            &solidity::encode_event_data(&(
                property_id,
                msg::sender(),
                number_of_days,
                msg::value()
            )),
            solidity::encode_event_sig("PropertyBookedEvent(uint256,address,uint256,uint256)"),
            msg::sender().into(),
        );
    }

    pub fn unbook_property(&mut self, property_id: u256) {
        let property = self.properties.get_mut(&property_id).expect("Property not found");

        require(
            property.owner == msg::sender(),
            "Only the Property Owner can unbook the property"
        );

        require(
            property.is_booked,
            "Property is not booked"
        );

        property.is_booked = false;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_property() {
        let mut contract = Airbnb::new();
        contract.constructor();

        contract.list_property(
            "Beach House".to_string(),
            "123 Ocean Dr".to_string(),
            "Beautiful beachfront property".to_string(),
            "http://example.com/img.jpg".to_string(),
            1_000_000.into(),
        );

        let property = contract.properties.get(&0.into()).unwrap();
        assert_eq!(property.name, "Beach House");
        assert_eq!(property.price_per_day, 1_000_000.into());
    }
}