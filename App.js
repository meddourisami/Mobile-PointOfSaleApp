import { View, StyleSheet, SafeAreaView} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import ClientNavigation from './Navigations/ClientNavigation';
import HomeNavigation from './Navigations/HomeNavigation';
import ProfileScreen from './Screens/ProfileScreen';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

async function initDatabase(db) {
  try{
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS Customers (
        name TEXT PRIMARY KEY,
        creation Date DEFAULT CURRENT_TIMESTAMP,
        modified Date DEFAULT CURRENT_TIMESTAMP,
        modified_by TEXT DEFAULT "Administrator",
        owner TEXT DEFAULT "admin@saadi.com",
        docstatus INTEGER DEFAULT 0,
        idx INTEGER DEFAULT 0,
        naming_series TEXT DEFAULT "CUST-.YYYY.-",
        salutation TEXT DEFAULT NULL,
        customer_type TEXT DEFAULT NULL,
        customer_group TEXT DEFAULT NULL,
        territory TEXT,
        gender TEXT DEFAULT NULL,
        lead_name TEXT DEFAULT NULL,
        opportunity_name TEXT DEFAULT NULL,
        account_manager TEXT DEFAULT NULL,
        image BLOB DEFAULT NULL,
        default_price_list TEXT DEFAULT NULL,
        default_bank_account TEXT DEFAULT NULL,
        default_currency TEXT DEFAULT NULL,
        is_internal_customer INTEGER DEFAULT 0,
        represents_company TEXT DEFAULT NULL,
        market_segment TEXT DEFAULT NULL,
        industry TEXT DEFAULT NULL,
        customer_pos_id INTEGER DEFAULT NULL,
        website TEXT DEFAULT NULL,
        language TEXT DEFAULT 'fr',
        customer_details TEXT DEFAULT NULL,
        customer_primary_contact TEXT DEFAULT NULL,
        mobile_no INTEGER DEFAULT NULL,
        email_id TEXT DEFAULT NULL,
        customer_primary_address TEXT DEFAULT NULL,
        primary_address TEXT DEFAULT NULL,
        tax_id INTEGER DEFAULT NULL,
        tax_category TEXT DEFAULT NULL,
        tax_withholding_category TEXT DEFAULT NULL,
        payment_terms TEXT DEFAULT NULL,
        loyalty_program TEXT DEFAULT NULL,
        loyalty_program_tier TEXT DEFAULT NULL,
        default_sales_partner TEXT DEFAULT NULL,
        default_commission_rate REAL DEFAULT 0,
        so_required INTEGER DEFAULT 0,
        dn_required INTEGER DEFAULT 0,
        is_frozen INTEGER DEFAULT 0,
        disabled INTEGER DEFAULT 0,
        _user_tags TEXT DEFAULT NULL,
        _comments TEXT DEFAULT NULL,
        _assign TEXT DEFAULT NULL,
        _liked_by TEXT DEFAULT NULL,
        custom_nrc INTEGER DEFAULT NULL,
        custom_nic INTEGER DEFAULT NULL,
        custom_nai INTEGER DEFAULT NULL,
        custom_code INTEGER,
        custom_address TEXT,
        custom_phone INTEGER,
        custom_nif TEXT,
        custom_stateprovince TEXT DEFAULT NULL,
        custom_fax INTEGER DEFAULT NULL,
        custom_activity TEXT,
        custom_email_address TEXT,
        custom_credit_limit REAL DEFAULT 0,
        custom_register INTEGER,
        custom_deadlines_to_max_in_nb_day INTEGER DEFAULT 0,
        custom_total_unpaid REAL DEFAULT 0,
        custom_capital_stock INTEGER DEFAULT NULL,
        custom_item INTEGER
      );

      CREATE TABLE IF NOT EXISTS Deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        creation DATE DEFAULT CURRENT_TIMESTAMP,
        modified DATE DEFAULT CURRENT_TIMESTAMP,
        modified_by TEXT DEFAULT "Adminstrator",
        owner TEXT DEFAULT "Adminstrator",
        docstatus INTEGER DEFAULT 0,
        idx DEFAULT 0,
        title TEXT,
        naming_series TEXT DEFAULT "MAT-DN-.YYYY.-",
        customer TEXT,
        tax_id TEXT DEFAULT NULL,
        customer_name TEXT,
        posting_date DATE DEFAULT CURRENT_DATE,
        posting_time TIME DEFAULT CURRENT_TIME,
        set_posting_time INTEGER DEFAULT 0,
        company TEXT,
        amended_from TEXT DEFAULT NULL,
        is_return INTEGER DEFAULT 0,
        issue_credit_note INTEGER DEFAULT 0,
        return_against TEXT DEFAULT NULL,
        cost_center TEXT DEFAULT NULL,
        project TEXT DEFAULT NULL,
        currency TEXT DEFAULT "DA",
        conversion_rate REAL DEFAULT 1,
        selling_price_list TEXT,
        price_list_currency TEXT DEFAULT "DA",
        plc_conversion_rate REAL DEFAULT 1,
        ignore_pricing_rule INTEGER DEFAULT 0,
        scan_barcode TEXT DEFAULT NULL,
        pick_list TEXT DEFAULT NULL,
        set_warehouse TEXT,
        set_target_warehouse TEXT DEFAULT NULL,
        total_qty INTEGER,
        total_net_weight REAL DEFAULT 0,
        base_total REAL,
        base_net_total REAL,
        total REAL,
        net_total REAL,
        tax_category TEXT DEFAULT " ",
        taxes_and_charges TEXT DEFAULT NULL,
        shipping_rule TEXT DEFAULT NULL,
        incoterm TEXT DEFAULT NULL,
        named_place TEXT DEFAULT NULL,
        base_total_taxes_and_charges REAL DEFAULT 0,
        total_taxes_and_charges REAL DEFAULT 0,
        base_grand_total REAL DEFAULT 0,
        base_rounding_adjustment REAL DEFAULT 0,
        base_rounded_total REAL DEFAULT 0,
        base_in_words TEXT DEFAULT NULL,
        grand_total REAL DEFAULT 0,
        rounding_adjustment REAL DEFAULT 0,
        rounded_total REAL DEFAULT 0,
        in_words TEXT DEFAULT NULL,
        disable_rounded_total INTEGER DEFAULT 0,
        apply_discount_on TEXT DEFAULT "Grand Total",
        base_discount_amount REAL DEFAULT 0,
        additional_discount_percentage REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        other_charges_calculation TEXT DEFAULT NULL,
        customer_address TEXT DEFAULT NULL,
        address_display TEXT DEFAULT NULL,
        contact_person TEXT DEFAULT NULL,
        contact_display TEXT DEFAULT NULL,
        contact_mobile TEXT DEFAULT NULL,
        contact_email TEXT DEFAULT NULL,
        shipping_address_name TEXT DEFAULT NULL,
        shipping_address TEXT DEFAULT NULL,
        dispatch_address_name TEXT DEFAULT NULL,
        dispatch_address TEXT DEFAULT NULL,
        company_address TEXT,
        company_address_display TEXT,
        tc_name TEXT DEFAULT NULL,
        terms TEXT DEFAULT NULL,
        per_billed INTEGER DEFAULT 0,
        status TEXT DEFAULT "To Bill",
        per_installed INTEGER DEFAULT 0,
        installation_status TEXT DEFAULT "Not Installed",
        per_returned INTEGER DEFAULT 0,
        transporter TEXT DEFAULT NULL,
        driver TEXT,
        lr_no TEXT DEFAULT NULL,
        vehicle_no TEXT,
        transporter_name TEXT DEFAULT NULL,
        driver_name TEXT,
        lr_date DATE DEFAULT CURRENT_TIMESTAMP,
        po_no TEXT DEFAULT "",
        po_date TEXT DEFAULT NULL,
        sales_partner TEXT DEFAULT NULL,
        amount_eligible_for_commission REAL,
        commission_rate REAL DEFAULT 0,
        total_commission REAL DEFAULT 0,
        auto_repeat INTEGER DEFAULT NULL,
        letter_head TEXT DEFAULT "En-Tête",
        print_without_amount INTEGER DEFAULT 0,
        group_same_items INTEGER DEFAULT 0,
        select_print_heading TEXT DEFAULT NULL,
        language TEXT DEFAULT "fr",
        is_internal_customer INTEGER DEFAULT 0,
        represents_company TEXT DEFAULT NULL,
        inter_company_reference TEXT DEFAULT NULL,
        customer_group TEXT DEFAULT "Individuel",
        territory TEXT,
        source TEXT DEFAULT NULL,
        campaign TEXT DEFAULT NULL,
        excise_page TEXT DEFAULT NULL,
        instructions TEXT DEFAULT NULL,
        _user_tags TEXT DEFAULT NULL,
        _comments TEXT DEFAULT NULL,
        _assign TEXT DEFAULT NULL,
        _liked_by TEXT DEFAULT NULL,
        _seen TEXT DEFAULT "Administrator",
        custom_solde INTEGER,
        custom_total_unpaid,
        custom_delivery_details TEXT DEFAULT NULL,
        custom_driver TEXT DEFAULT NULL,
        custom_driver_name TEXT,
        custom_vehicle TEXT
      );
    `);
    console.log('Database initialized');
  }catch(error){
    console.log("Error initializing database",error);
  }
}



export default function App() {
  const Tab = createBottomTabNavigator();
  return (
    
    <SQLiteProvider databaseName='myDB.db' onInit={initDatabase}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{
          tabBarStyle: { backgroundColor:'#284979', borderTopLeftRadius:15 , borderTopRightRadius:15 },
        }}>
          <Tab.Screen name="Home" component={HomeNavigation} options={{
            tabBarIcon: ({ focused }) => (
              <View>
               <FontAwesome5 name="home" size={24} color="white" />
              </View>
            ),
            tabBarOptions: {
              activeTintColor: '#284979',
              inactiveTintColor: '#FFFFFF',
            },
          }}/>
          <Tab.Screen name="Clients" component={ClientNavigation} screenOptions={{headerShown:false}} options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <FontAwesome6 name="people-group" size={24} color="white" />
              </View>
            ),
            tabBarOptions: {
              activeTintColor: '#284979',
              inactiveTintColor: '#FFFFFF',
            },
            }}/>
          <Tab.Screen name="Profile" component={ProfileScreen} options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Ionicons name="person-sharp" size={24} color="white" />
              </View>
            ),
            tabBarOptions: {
              activeTintColor: '#284979',
              inactiveTintColor: '#FFFFFF',
            },
            }}/>
        </Tab.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
    
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});