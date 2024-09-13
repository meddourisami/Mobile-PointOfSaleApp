import React, { startTransition, useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import ClientNavigation from './Navigations/ClientNavigation';
import HomeNavigation from './Navigations/HomeNavigation';
import ProfileScreen from './Screens/ProfileScreen';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { BudgetProvider } from './BudgetContext';
import { SyncProvider } from './SyncContext';
import SettingsScreen from './Settings/SettingsScreen';
import AntDesign from '@expo/vector-icons/AntDesign';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginPage from './LoginPage';
import AsyncStorage from '@react-native-async-storage/async-storage';


async function initDatabase(db) {
  try{
    // await db.execAsync(`
    //   DROP TABLE IF EXISTS Customers;
    //   DROP TABLE IF EXISTS CustomerMetadata;
    //   DROP TABLE IF EXISTS Deliveries;
    //   DROP TABLE IF EXISTS DeliveryMetadata;
    //   DROP TABLE IF EXISTS TaxesMetadata;
    //   DROP TABLE IF EXISTS GroupItem;
    //   DROP TABLE IF EXISTS Item;
    //   DROP TABLE IF EXISTS ItemMetadata;
    //   DROP TABLE IF EXISTS Warehouse;
    //   DROP TABLE IF EXISTS Sales_Taxes_and_Charges;
    //   DROP TABLE IF EXISTS Sales_Order;
    //   DROP TABLE IF EXISTS Sales_Order_Item;
    //   DROP TABLE IF EXISTS Quotation;
    //   DROP TABLE IF EXISTS Quotation_Item;
    //   DROP TABLE IF EXISTS Tax_Categories;
    //   DROP TABLE IF EXISTS Sales_Invoice;
    //   DROP TABLE IF EXISTS Sales_Invoice_Item;
    //   DROP TABLE IF EXISTS Sales_Invoice_Payment;
    //   DROP TABLE IF EXISTS sales_invoice_logs;
    //   DROP TABLE IF EXISTS sales_order_logs;
    //   DROP TABLE IF EXISTS Payment_Entry;
    //   DROP TABLE IF EXISTS Payment_Entry_Reference;
    //   DROP TABLE IF EXISTS Delivery_Note_Item;
    //   DROP TABLE IF EXISTS payment_entry_logs;
    //   DROP TABLE IF EXISTS delivery_note_logs;

    //  `
    // );
    // await db.execAsync(`DROP TABLE IF EXISTS User_Profile;`)
    await db.execAsync(`
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
        customer_name TEXT,
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
        custom_phone TEXT,
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
        custom_item INTEGER,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS Deliveries(
        name TEXT PRIMARY KEY,
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
      
      CREATE TABLE IF NOT EXISTS GroupItem(
        name TEXT PRIMARY KEY,
        item_group_name TEXT,
        parent_item_group TEXT
      );

      CREATE TABLE IF NOT EXISTS Item (
          name TEXT PRIMARY KEY NOT NULL,
          owner TEXT,
          creation TIMESTAMP,
          modified TIMESTAMP,
          modified_by TEXT,
          docstatus INTEGER,
          idx INTEGER,
          naming_series TEXT,
          item_code TEXT,
          item_name TEXT,
          item_group TEXT,
          stock_uom TEXT,
          disabled BOOLEAN,
          allow_alternative_item BOOLEAN,
          is_stock_item BOOLEAN,
          has_variants BOOLEAN,
          opening_stock REAL,
          valuation_rate REAL,
          standard_rate REAL,
          is_fixed_asset BOOLEAN,
          auto_create_assets BOOLEAN,
          is_grouped_asset BOOLEAN,
          asset_category TEXT,
          asset_naming_series TEXT,
          over_delivery_receipt_allowance REAL,
          over_billing_allowance REAL,
          image TEXT,
          description TEXT,
          brand TEXT,
          shelf_life_in_days INTEGER,
          end_of_life DATE,
          default_material_request_type TEXT,
          valuation_method TEXT,
          warranty_period INTEGER,
          weight_per_unit REAL,
          weight_uom TEXT,
          allow_negative_stock BOOLEAN,
          has_batch_no BOOLEAN,
          create_new_batch BOOLEAN,
          batch_number_series TEXT,
          has_expiry_date BOOLEAN,
          retain_sample BOOLEAN,
          sample_quantity REAL,
          has_serial_no BOOLEAN,
          serial_no_series TEXT,
          variant_of TEXT,
          variant_based_on TEXT,
          enable_deferred_expense BOOLEAN,
          no_of_months_exp INTEGER,
          enable_deferred_revenue BOOLEAN,
          no_of_months INTEGER,
          purchase_uom TEXT,
          min_order_qty REAL,
          safety_stock REAL,
          is_purchase_item BOOLEAN,
          lead_time_days INTEGER,
          last_purchase_rate REAL,
          is_customer_provided_item BOOLEAN,
          customer TEXT,
          delivered_by_supplier BOOLEAN,
          country_of_origin TEXT,
          customs_tariff_number TEXT,
          sales_uom TEXT,
          grant_commission BOOLEAN,
          is_sales_item BOOLEAN,
          max_discount REAL,
          inspection_required_before_purchase BOOLEAN,
          quality_inspection_template TEXT,
          inspection_required_before_delivery BOOLEAN,
          include_item_in_manufacturing BOOLEAN,
          is_sub_contracted_item BOOLEAN,
          default_bom TEXT,
          customer_code TEXT,
          default_item_manufacturer TEXT,
          default_manufacturer_part_no TEXT,
          total_projected_qty REAL,
          _comment_count INTEGER,
          bal_qty INTEGER,
          bal_val INTEGER
        );

        CREATE TABLE IF NOT EXISTS Warehouse (
          name TEXT NOT NULL PRIMARY KEY,
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          owner TEXT,
          docstatus INTEGER DEFAULT 0 NOT NULL,
          idx INTEGER DEFAULT 0 NOT NULL,
          disabled INTEGER DEFAULT 0 NOT NULL,
          warehouse_name TEXT,
          is_group INTEGER DEFAULT 0 NOT NULL,
          parent_warehouse TEXT,
          is_rejected_warehouse INTEGER DEFAULT 0 NOT NULL,
          account TEXT,
          company TEXT,
          email_id TEXT,
          phone_no TEXT,
          mobile_no TEXT,
          address_line_1 TEXT,
          address_line_2 TEXT,
          city TEXT,
          state TEXT,
          pin TEXT,
          warehouse_type TEXT,
          default_in_transit_warehouse TEXT,
          lft INTEGER DEFAULT 0 NOT NULL,
          rgt INTEGER DEFAULT 0 NOT NULL,
          old_parent TEXT,
          _user_tags TEXT,
          _comments TEXT,
          _assign TEXT,
          _liked_by TEXT
        );

        CREATE TABLE IF NOT EXISTS Sales_Taxes_and_Charges (
          name TEXT PRIMARY KEY,
          owner TEXT,
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          docstatus INTEGER,
          idx INTEGER,
          charge_type TEXT,
          row_id TEXT,
          account_head TEXT,
          description TEXT,
          included_in_print_rate INTEGER,
          included_in_paid_amount INTEGER,
          cost_center TEXT,
          rate REAL,
          account_currency TEXT,
          tax_amount REAL,
          total REAL,
          tax_amount_after_discount_amount REAL,
          base_tax_amount REAL,
          base_total REAL,
          base_tax_amount_after_discount_amount REAL,
          item_wise_tax_detail TEXT,
          dont_recompute_tax INTEGER,
          parent TEXT,
          parentfield TEXT,
          parenttype TEXT
        );

        CREATE TABLE IF NOT EXISTS Sales_Order (
          name TEXT PRIMARY KEY NOT NULL,
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          owner TEXT,
          docstatus INTEGER DEFAULT 0 NOT NULL,
          idx INTEGER DEFAULT 0 NOT NULL,
          title TEXT DEFAULT '{customer_name}',
          naming_series TEXT,
          customer TEXT,
          customer_name TEXT,
          tax_id TEXT,
          order_type TEXT DEFAULT 'Sales',
          transaction_date DATE,
          delivery_date DATE,
          po_no TEXT,
          po_date DATE,
          company TEXT,
          skip_delivery_note INTEGER DEFAULT 0 NOT NULL,
          amended_from TEXT,
          cost_center TEXT,
          project TEXT,
          currency TEXT,
          conversion_rate REAL DEFAULT 0.0 NOT NULL,
          selling_price_list TEXT,
          price_list_currency TEXT,
          plc_conversion_rate REAL DEFAULT 0.0 NOT NULL,
          ignore_pricing_rule INTEGER DEFAULT 0 NOT NULL,
          scan_barcode TEXT,
          set_warehouse TEXT,
          reserve_stock INTEGER DEFAULT 0 NOT NULL,
          total_qty REAL DEFAULT 0.0 NOT NULL,
          total_net_weight REAL DEFAULT 0.0 NOT NULL,
          base_total REAL DEFAULT 0.0 NOT NULL,
          base_net_total REAL DEFAULT 0.0 NOT NULL,
          total REAL DEFAULT 0.0 NOT NULL,
          net_total REAL DEFAULT 0.0 NOT NULL,
          tax_category TEXT,
          taxes_and_charges TEXT,
          shipping_rule TEXT,
          incoterm TEXT,
          named_place TEXT,
          base_total_taxes_and_charges REAL DEFAULT 0.0 NOT NULL,
          total_taxes_and_charges REAL DEFAULT 0.0 NOT NULL,
          base_grand_total REAL DEFAULT 0.0 NOT NULL,
          base_rounding_adjustment REAL DEFAULT 0.0 NOT NULL,
          base_rounded_total REAL DEFAULT 0.0 NOT NULL,
          base_in_words TEXT DEFAULT NULL,
          grand_total REAL DEFAULT 0.0 NOT NULL,
          rounding_adjustment REAL DEFAULT 0.0,
          rounded_total REAL DEFAULT 0.0 NOT NULL,
          in_words TEXT,
          advance_paid REAL DEFAULT 0.0 NOT NULL,
          disable_rounded_total INTEGER DEFAULT 0 NOT NULL,
          apply_discount_on TEXT DEFAULT 'Grand Total',
          base_discount_amount REAL DEFAULT 0.0 NOT NULL,
          coupon_code TEXT,
          additional_discount_percentage REAL DEFAULT 0.0 NOT NULL,
          discount_amount REAL DEFAULT 0.0 NOT NULL,
          other_charges_calculation TEXT,
          customer_address TEXT,
          address_display TEXT,
          customer_group TEXT,
          territory TEXT,
          contact_person TEXT,
          contact_display TEXT,
          contact_phone TEXT,
          contact_mobile TEXT,
          contact_email TEXT,
          shipping_address_name TEXT,
          shipping_address TEXT,
          dispatch_address_name TEXT,
          dispatch_address TEXT,
          company_address TEXT,
          company_address_display TEXT,
          payment_terms_template TEXT,
          tc_name TEXT,
          terms TEXT,
          status TEXT DEFAULT 'Draft',
          delivery_status TEXT,
          per_delivered REAL DEFAULT 0.0 NOT NULL,
          per_billed REAL DEFAULT 0.0 NOT NULL,
          per_picked REAL DEFAULT 0.0 NOT NULL,
          billing_status TEXT,
          sales_partner TEXT,
          amount_eligible_for_commission REAL DEFAULT 0.0 NOT NULL,
          commission_rate REAL DEFAULT 0.0 NOT NULL,
          total_commission REAL DEFAULT 0.0 NOT NULL,
          loyalty_points INTEGER DEFAULT 0 NOT NULL,
          loyalty_amount REAL DEFAULT 0.0 NOT NULL,
          from_date DATE,
          to_date DATE,
          auto_repeat TEXT,
          letter_head TEXT,
          group_same_items INTEGER DEFAULT 0 NOT NULL,
          select_print_heading TEXT,
          language TEXT,
          is_internal_customer INTEGER DEFAULT 0 NOT NULL,
          represents_company TEXT,
          source TEXT,
          inter_company_order_reference TEXT,
          campaign TEXT,
          party_account_currency TEXT,
          _user_tags TEXT,
          _comments TEXT,
          _assign TEXT,
          _liked_by TEXT,
          _seen TEXT
        );

        CREATE TABLE IF NOT EXISTS Sales_Order_Item (
          name TEXT PRIMARY KEY NOT NULL,
          parent TEXT NOT NULL,
          parentfield TEXT,
          parenttype TEXT,
          idx INTEGER,
          item_code TEXT,
          item_name TEXT,
          description TEXT,
          qty REAL,
          stock_uom TEXT,
          rate REAL,
          amount REAL,
          base_rate REAL,
          base_amount REAL,
          warehouse TEXT,
          delivered_qty REAL,
          billed_amt REAL,
          pending_qty REAL,
          against_sales_order TEXT,
          against_sales_order_item TEXT,
          delivered_by_supplier INTEGER DEFAULT 0 NOT NULL,
          conversion_factor REAL DEFAULT 0.0 NOT NULL,
          pricing_rule TEXT,
          discount_percentage REAL DEFAULT 0.0 NOT NULL,
          gross_profit REAL DEFAULT 0.0 NOT NULL,
          gross_margin REAL DEFAULT 0.0 NOT NULL,
          against_blanket_order TEXT      
        );

        CREATE TABLE IF NOT EXISTS Quotation (
          name TEXT NOT NULL PRIMARY KEY,
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          owner TEXT,
          docstatus INTEGER DEFAULT 0 NOT NULL,
          idx INTEGER DEFAULT 0 NOT NULL,
          title TEXT DEFAULT '{customer_name}',
          naming_series TEXT,
          quotation_to TEXT DEFAULT 'Customer',
          party_name TEXT,
          customer_name TEXT,
          transaction_date DATE,
          valid_till DATE,
          order_type TEXT DEFAULT 'Sales',
          company TEXT,
          amended_from TEXT,
          currency TEXT,
          conversion_rate REAL DEFAULT 0.0 NOT NULL,
          selling_price_list TEXT,
          price_list_currency TEXT,
          plc_conversion_rate REAL DEFAULT 0.0 NOT NULL,
          ignore_pricing_rule INTEGER DEFAULT 0 NOT NULL,
          scan_barcode TEXT,
          total_qty REAL DEFAULT 0.0 NOT NULL,
          total_net_weight REAL DEFAULT 0.0 NOT NULL,
          base_total REAL DEFAULT 0.0 NOT NULL,
          base_net_total REAL DEFAULT 0.0 NOT NULL,
          total REAL DEFAULT 0.0 NOT NULL,
          net_total REAL DEFAULT 0.0 NOT NULL,
          tax_category TEXT,
          taxes_and_charges TEXT,
          shipping_rule TEXT,
          incoterm TEXT,
          named_place TEXT,
          base_total_taxes_and_charges REAL DEFAULT 0.0 NOT NULL,
          total_taxes_and_charges REAL DEFAULT 0.0 NOT NULL,
          base_grand_total REAL DEFAULT 0.0 NOT NULL,
          base_rounding_adjustment REAL DEFAULT 0.0 NOT NULL,
          base_rounded_total REAL DEFAULT 0.0 NOT NULL,
          base_in_words TEXT,
          grand_total REAL DEFAULT 0.0 NOT NULL,
          rounding_adjustment REAL DEFAULT 0.0 NOT NULL,
          rounded_total REAL DEFAULT 0.0 NOT NULL,
          in_words TEXT,
          apply_discount_on TEXT DEFAULT 'Grand Total',
          base_discount_amount REAL DEFAULT 0.0 NOT NULL,
          coupon_code TEXT,
          additional_discount_percentage REAL DEFAULT 0.0,
          discount_amount REAL DEFAULT 0.0 NOT NULL,
          referral_sales_partner TEXT,
          other_charges_calculation TEXT,
          customer_address TEXT,
          address_display TEXT,
          contact_person TEXT,
          contact_display TEXT,
          contact_mobile TEXT,
          contact_email TEXT,
          shipping_address_name TEXT,
          shipping_address TEXT,
          company_address TEXT,
          company_address_display TEXT,
          payment_terms_template TEXT,
          tc_name TEXT,
          terms TEXT,
          auto_repeat TEXT,
          letter_head TEXT,
          group_same_items INTEGER DEFAULT 0 NOT NULL,
          select_print_heading TEXT,
          language TEXT,
          order_lost_reason TEXT,
          status TEXT DEFAULT 'Draft',
          customer_group TEXT,
          territory TEXT,
          campaign TEXT,
          source TEXT,
          opportunity TEXT,
          supplier_quotation TEXT,
          enq_det TEXT,
          _user_tags TEXT,
          _comments TEXT,
          _assign TEXT,
          _liked_by TEXT
        );

        CREATE TABLE IF NOT EXISTS Quotation_Item (
          name TEXT NOT NULL PRIMARY KEY,
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          owner TEXT,
          docstatus INTEGER DEFAULT 0 NOT NULL,
          idx INTEGER DEFAULT 0 NOT NULL,
          item_code TEXT,
          customer_item_code TEXT,
          item_name TEXT,
          description TEXT,
          item_group TEXT,
          brand TEXT,
          image TEXT,
          qty REAL DEFAULT 0.0 NOT NULL,
          stock_uom TEXT,
          uom TEXT,
          conversion_factor REAL DEFAULT 0.0 NOT NULL,
          stock_qty REAL DEFAULT 0.0 NOT NULL,
          price_list_rate REAL DEFAULT 0.0 NOT NULL,
          base_price_list_rate REAL DEFAULT 0.0 NOT NULL,
          margin_type TEXT,
          margin_rate_or_amount REAL DEFAULT 0.0 NOT NULL,
          rate_with_margin REAL DEFAULT 0.0 NOT NULL,
          discount_percentage REAL DEFAULT 0.0 NOT NULL,
          discount_amount REAL DEFAULT 0.0 NOT NULL,
          base_rate_with_margin REAL DEFAULT 0.0 NOT NULL,
          rate REAL DEFAULT 0.0 NOT NULL,
          net_rate REAL DEFAULT 0.0 NOT NULL,
          amount REAL DEFAULT 0.0 NOT NULL,
          net_amount REAL DEFAULT 0.0 NOT NULL,
          item_tax_template TEXT,
          base_rate REAL DEFAULT 0.0 NOT NULL,
          base_net_rate REAL DEFAULT 0.0 NOT NULL,
          base_amount REAL DEFAULT 0.0 NOT NULL,
          base_net_amount REAL DEFAULT 0.0 NOT NULL,
          pricing_rules TEXT,
          stock_uom_rate REAL DEFAULT 0.0 NOT NULL,
          is_free_item INTEGER DEFAULT 0 NOT NULL,
          is_alternative INTEGER DEFAULT 0 NOT NULL,
          has_alternative_item INTEGER DEFAULT 0 NOT NULL,
          valuation_rate REAL DEFAULT 0.0 NOT NULL,
          gross_profit REAL DEFAULT 0.0 NOT NULL,
          weight_per_unit REAL DEFAULT 0.0 NOT NULL,
          total_weight REAL DEFAULT 0.0 NOT NULL,
          weight_uom TEXT,
          warehouse TEXT,
          against_blanket_order INTEGER DEFAULT 0 NOT NULL,
          blanket_order TEXT,
          blanket_order_rate REAL DEFAULT 0.0 NOT NULL,
          prevdoc_doctype TEXT,
          prevdoc_docname TEXT,
          projected_qty REAL DEFAULT 0.0 NOT NULL,
          actual_qty REAL DEFAULT 0.0 NOT NULL,
          item_tax_rate TEXT,
          additional_notes TEXT,
          page_break INTEGER DEFAULT 0 NOT NULL,
          parent TEXT,         
          parentfield TEXT,
          parenttype TEXT
        );

        CREATE TABLE IF NOT EXISTS Tax_Categories(
          name TEXT NOT NULL PRIMARY KEY,
          creation DATE,
          modified DATE,
          modified_by TEXT,
          owner TEXT DEFAULT "Administrator",
          docstatus INTEGER DEFAULT 0,
          idx INTEGER DEFAULT 0,
          title TEXT,
          is_default INTEGER DEFAULT 0,
          disabled INTEGER DEFAULT 0,
          company TEXT,
          tax_category TEXT,
          user_tags TEXT,
          _comments TEXT,
          _assign TEXT,
          _liked_by TEXT
        );

        CREATE TABLE IF NOT EXISTS Sales_Invoice (
          name TEXT PRIMARY KEY UNIQUE NOT NULL, -- Unique identifier for the sales invoice
          creation DATETIME, -- Creation timestamp
          modified DATETIME, -- Last modified timestamp
          modified_by TEXT, -- Last modified by
          owner TEXT, -- Owner
          docstatus INTEGER DEFAULT 0 NOT NULL, -- Document status
          idx INTEGER DEFAULT 0 NOT NULL, -- Index
          title TEXT, -- Title defaultcustomername ---------
          naming_series TEXT, -- Naming series
          customer TEXT, -- Reference to the customer
          customer_name TEXT, -- Customer name
          tax_id TEXT, -- Customer's tax ID
          company_tax_id TEXT, -- Company's tax ID
          posting_date DATE, -- Posting date
          posting_time TIME, -- Posting time
          set_posting_time INTEGER DEFAULT 0 NOT NULL, -- Set posting time
          due_date DATE, -- Due date
          is_pos INTEGER DEFAULT 0 NOT NULL, -- Is POS
          is_consolidated INTEGER DEFAULT 0 NOT NULL, -- Is consolidated
          is_return INTEGER DEFAULT 0 NOT NULL, -- Is return
          return_against TEXT, -- Return against
          update_outstanding_for_self INTEGER DEFAULT 1 NOT NULL, -- Update outstanding for self
          update_billed_amount_in_sales_order INTEGER DEFAULT 0 NOT NULL, -- Update billed amount in sales order
          update_billed_amount_in_delivery_note INTEGER DEFAULT 1 NOT NULL, -- Update billed amount in delivery note
          is_debit_note INTEGER DEFAULT 0 NOT NULL, -- Is debit note
          amended_from TEXT, -- Amended from
          cost_center TEXT, -- Cost center
          project TEXT, -- Project
          currency TEXT, -- Currency
          conversion_rate DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Conversion rate
          selling_price_list VARCHAR(140), -- Selling price list
          price_list_currency VARCHAR(140), -- Price list currency
          plc_conversion_rate DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Price list conversion rate
          ignore_pricing_rule INTEGER DEFAULT 0 NOT NULL, -- Ignore pricing rule
          scan_barcode VARCHAR(140), -- Scan barcode
          update_stock INTEGER DEFAULT 0 NOT NULL, -- Update stock
          set_warehouse VARCHAR(140), -- Set warehouse
          set_target_warehouse VARCHAR(140), -- Set target warehouse
          total_qty DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Total quantity
          total_net_weight DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Total net weight
          base_total DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base total
          base_net_total DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base net total
          total DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Total
          net_total DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Net total
          tax_category VARCHAR(140), -- Tax category
          taxes_and_charges VARCHAR(140), -- Taxes and charges
          shipping_rule VARCHAR(140), -- Shipping rule
          incoterm VARCHAR(140), -- Incoterm
          named_place VARCHAR(140), -- Named place
          base_total_taxes_and_charges DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base total taxes and charges
          total_taxes_and_charges DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Total taxes and charges
          base_grand_total DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base grand total
          base_rounding_adjustment DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base rounding adjustment
          base_rounded_total DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base rounded total
          base_in_words TEXT, -- Base in words
          grand_total DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Grand total
          rounding_adjustment DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Rounding adjustment
          use_company_roundoff_cost_center INTEGER DEFAULT 0 NOT NULL, -- Use company roundoff cost center
          rounded_total DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Rounded total
          in_words TEXT, -- In words
          total_advance DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Total advance
          outstanding_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Outstanding amount
          disable_rounded_total INT(1) DEFAULT 0 NOT NULL, -- Disable rounded total
          apply_discount_on VARCHAR(15) DEFAULT 'Grand Total', -- Apply discount on
          base_discount_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base discount amount
          is_cash_or_non_trade_discount INTEGER DEFAULT 0 NOT NULL, -- Is cash or non-trade discount
          additional_discount_account VARCHAR(140), -- Additional discount account
          additional_discount_percentage DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Additional discount percentage
          discount_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Discount amount
          other_charges_calculation TEXT, -- Other charges calculation
          total_billing_hours DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Total billing hours
          total_billing_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Total billing amount
          cash_bank_account VARCHAR(140), -- Cash bank account
          base_paid_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base paid amount
          paid_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Paid amount
          base_change_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base change amount
          change_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Change amount
          account_for_change_amount VARCHAR(140), -- Account for change amount
          allocate_advances_automatically INTEGER DEFAULT 0 NOT NULL, -- Allocate advances automatically
          only_include_allocated_payments INTEGER DEFAULT 0 NOT NULL, -- Only include allocated payments
          write_off_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Write off amount
          base_write_off_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Base write off amount
          write_off_outstanding_amount_automatically INTEGER DEFAULT 0 NOT NULL, -- Write off outstanding amount automatically
          write_off_account VARCHAR(140), -- Write off account
          write_off_cost_center VARCHAR(140), -- Write off cost center
          redeem_loyalty_points INTEGER DEFAULT 0 NOT NULL, -- Redeem loyalty points
          loyalty_points INTEGR DEFAULT 0 NOT NULL, -- Loyalty points
          loyalty_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Loyalty amount
          loyalty_program VARCHAR(140), -- Loyalty program
          loyalty_redemption_account VARCHAR(140), -- Loyalty redemption account
          loyalty_redemption_cost_center VARCHAR(140), -- Loyalty redemption cost center
          customer_address VARCHAR(140), -- Customer address
          address_display TEXT, -- Address display
          contact_person VARCHAR(140), -- Contact person
          contact_display TEXT, -- Contact display
          contact_mobile TEXT, -- Contact mobile
          contact_email VARCHAR(140), -- Contact email
          territory VARCHAR(140), -- Territory
          shipping_address_name VARCHAR(140), -- Shipping address name
          shipping_address TEXT, -- Shipping address
          dispatch_address_name VARCHAR(140), -- Dispatch address name
          dispatch_address TEXT, -- Dispatch address
          company_address VARCHAR(140), -- Company address
          company_address_display TEXT, -- Company address display
          ignore_default_payment_terms_template INTEGER DEFAULT 0 NOT NULL, -- Ignore default payment terms template
          payment_terms_template VARCHAR(140), -- Payment terms template
          tc_name VARCHAR(140), -- Terms and conditions name
          terms TEXT, -- Terms
          po_no VARCHAR(140), -- Purchase order number
          po_date DATE, -- Purchase order date
          debit_to VARCHAR(140), -- Debit to
          party_account_currency VARCHAR(140), -- Party account currency
          is_opening VARCHAR(4) DEFAULT 'No', -- Is opening
          unrealized_profit_loss_account VARCHAR(140), -- Unrealized profit/loss account
          against_income_account TEXT, -- Against income account
          sales_partner VARCHAR(140), -- Sales partner
          amount_eligible_for_commission DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Amount eligible for commission
          commission_rate DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Commission rate
          total_commission DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL, -- Total commission
          letter_head VARCHAR(140), -- Letter head
          group_same_items INTEGER DEFAULT 0 NOT NULL, -- Group same items
          select_print_heading VARCHAR(140), -- Select print heading
          language VARCHAR(6), -- Language
          subscription VARCHAR(140), -- Subscription
          from_date DATE, -- From date
          auto_repeat VARCHAR(140), -- Auto repeat
          to_date DATE, -- To date
          status VARCHAR(30) DEFAULT 'Draft', -- Status
          inter_company_invoice_reference VARCHAR(140), -- Inter-company invoice reference
          campaign VARCHAR(140), -- Campaign
          represents_company VARCHAR(140), -- Represents company
          source VARCHAR(140), -- Source
          customer_group VARCHAR(140), -- Customer group
          is_internal_customer INTEGER DEFAULT 0 NOT NULL, -- Is internal customer
          is_discounted INTEGR DEFAULT 0 NOT NULL, -- Is discounted
          remarks TEXT, -- Remarks
          repost_required INTEGER DEFAULT 0 NOT NULL, -- Repost required
          _user_tags TEXT, -- User tags
          _comments TEXT, -- Comments
          _assign TEXT, -- Assign
          _liked_by TEXT, -- Liked_by
          _seen TEXT -- Seen
        );

        CREATE TABLE IF NOT EXISTS Sales_Invoice_Item (
          name TEXT PRIMARY KEY NOT NULL UNIQUE, -- Unique identifier for the sales invoice item
          creation DATETIME, -- Creation timestamp
          modified DATETIME, -- Last modified timestamp
          modified_by TEXT, -- Last modified by
          owner TEXT, -- Owner
          docstatus INTEGER DEFAULT 0 NOT NULL, -- Document status
          idx INTEGER DEFAULT 0 NOT NULL, -- Index
          barcode TEXT, -- Barcode
          has_item_scanned INTEGER DEFAULT 0 NOT NULL, -- Has item scanned
          item_code TEXT, -- Item code
          item_name TEXT, -- Item name
          customer_item_code TEXT, -- Customer item code
          description TEXT, -- Description
          item_group TEXT, -- Item group
          brand TEXT, -- Brand
          image TEXT, -- Image
          qty REAL DEFAULT 0.000000000 NOT NULL, -- Quantity
          stock_uom TEXT, -- Stock unit of measurement
          uom TEXT, -- Unit of measurement
          conversion_factor REAL DEFAULT 0.000000000 NOT NULL, -- Conversion factor
          stock_qty REAL DEFAULT 0.000000000 NOT NULL, -- Stock quantity
          price_list_rate REAL DEFAULT 0.000000000 NOT NULL, -- Price list rate
          base_price_list_rate REAL DEFAULT 0.000000000 NOT NULL, -- Base price list rate
          margin_type TEXT, -- Margin type
          margin_rate_or_amount REAL DEFAULT 0.000000000 NOT NULL, -- Margin rate or amount
          rate_with_margin REAL DEFAULT 0.000000000 NOT NULL, -- Rate with margin
          discount_percentage REAL DEFAULT 0.000000000 NOT NULL, -- Discount percentage
          discount_amount REAL DEFAULT 0.000000000 NOT NULL, -- Discount amount
          base_rate_with_margin REAL DEFAULT 0.000000000 NOT NULL, -- Base rate with margin
          rate REAL DEFAULT 0.000000000 NOT NULL, -- Rate
          amount REAL DEFAULT 0.000000000 NOT NULL, -- Amount
          item_tax_template TEXT, -- Item tax template
          base_rate REAL DEFAULT 0.000000000 NOT NULL, -- Base rate
          base_amount REAL DEFAULT 0.000000000 NOT NULL, -- Base amount
          pricing_rules TEXT, -- Pricing rules
          stock_uom_rate REAL DEFAULT 0.000000000 NOT NULL, -- Stock UOM rate
          is_free_item INTEGER DEFAULT 0 NOT NULL, -- Is free item
          grant_commission INTEGER DEFAULT 0 NOT NULL, -- Grant commission
          net_rate REAL DEFAULT 0.000000000 NOT NULL, -- Net rate
          net_amount REAL DEFAULT 0.000000000 NOT NULL, -- Net amount
          base_net_rate REAL DEFAULT 0.000000000 NOT NULL, -- Base net rate
          base_net_amount REAL DEFAULT 0.000000000 NOT NULL, -- Base net amount
          delivered_by_supplier INTEGER DEFAULT 0 NOT NULL, -- Delivered by supplier
          income_account TEXT, -- Income account
          is_fixed_asset INTEGER DEFAULT 0 NOT NULL, -- Is fixed asset
          asset TEXT, -- Asset
          finance_book TEXT, -- Finance book
          expense_account TEXT, -- Expense account
          discount_account TEXT, -- Discount account
          deferred_revenue_account TEXT, -- Deferred revenue account
          service_stop_date DATE, -- Service stop date
          enable_deferred_revenue INTEGER DEFAULT 0 NOT NULL, -- Enable deferred revenue
          service_start_date DATE, -- Service start date
          service_end_date DATE, -- Service end date
          weight_per_unit REAL DEFAULT 0.000000000 NOT NULL, -- Weight per unit
          total_weight REAL DEFAULT 0.000000000 NOT NULL, -- Total weight
          weight_uom TEXT, -- Weight unit of measurement
          warehouse TEXT, -- Warehouse
          target_warehouse TEXT, -- Target warehouse
          quality_inspection TEXT, -- Quality inspection
          serial_and_batch_bundle TEXT, -- Serial and batch bundle
          use_serial_batch_fields INTEGER DEFAULT 0 NOT NULL, -- Use serial batch fields
          allow_zero_valuation_rate INTEGER DEFAULT 0 NOT NULL, -- Allow zero valuation rate
          incoming_rate REAL DEFAULT 0.000000000 NOT NULL, -- Incoming rate
          item_tax_rate TEXT, -- Item tax rate
          actual_batch_qty REAL DEFAULT 0.000000000 NOT NULL, -- Actual batch quantity
          actual_qty REAL DEFAULT 0.000000000 NOT NULL, -- Actual quantity
          serial_no TEXT, -- Serial number
          batch_no TEXT, -- Batch number
          sales_order TEXT, -- Sales order
          so_detail TEXT, -- Sales order detail
          sales_invoice_item TEXT, -- Sales invoice item
          delivery_note TEXT, -- Delivery note
          dn_detail TEXT, -- Delivery note detail
          delivered_qty REAL DEFAULT 0.000000000 NOT NULL, -- Delivered quantity
          purchase_order TEXT, -- Purchase order
          purchase_order_item TEXT, -- Purchase order item
          cost_center TEXT, -- Cost center
          project TEXT, -- Project
          page_break INTEGER DEFAULT 0 NOT NULL, -- Page break
          parent TEXT, -- Parent
          parentfield TEXT, -- Parent field
          parenttype TEXT
        );

        CREATE TABLE IF NOT EXISTS Sales_Invoice_Payment (
          name TEXT PRIMARY KEY UNIQUE NOT NULL, 
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          owner TEXT,
          docstatus INTEGER DEFAULT 0 NOT NULL,
          idx INTEGER DEFAULT 0 NOT NULL,
          "default" INTEGER DEFAULT 0 NOT NULL,
          mode_of_payment TEXT,
          amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL,
          reference_no TEXT,
          account TEXT,
          type TEXT,
          base_amount DECIMAL(21, 9) DEFAULT 0.000000000 NOT NULL,
          clearance_date DATE,
          parent TEXT,
          parentfield TEXT,
          parenttype TEXT
        );

        CREATE TABLE IF NOT EXISTS Payment_Entry (
          name TEXT NOT NULL PRIMARY KEY,
          creation DATETIME NULL,
          modified DATETIME NULL,
          modified_by TEXT NULL,
          owner TEXT NULL,
          docstatus INTEGER DEFAULT 0 NOT NULL,
          idx INTEGER DEFAULT 0 NOT NULL,
          naming_series TEXT NULL,
          payment_type TEXT NULL,
          payment_order_status TEXT NULL,
          posting_date DATE NULL,
          company TEXT NULL,
          mode_of_payment TEXT NULL,
          party_type TEXT NULL,
          party TEXT NULL,
          party_name TEXT NULL,
          book_advance_payments_in_separate_party_account INTEGER DEFAULT 0 NOT NULL,
          reconcile_on_advance_payment_date INTEGER DEFAULT 0 NOT NULL,
          bank_account TEXT NULL,
          party_bank_account TEXT NULL,
          contact_person TEXT NULL,
          contact_email TEXT NULL,
          party_balance REAL DEFAULT 0.000000000 NOT NULL,
          paid_from TEXT NULL,
          paid_from_account_type TEXT NULL,
          paid_from_account_currency TEXT NULL,
          paid_from_account_balance REAL DEFAULT 0.000000000 NOT NULL,
          paid_to TEXT NULL,
          paid_to_account_type TEXT NULL,
          paid_to_account_currency TEXT NULL,
          paid_to_account_balance REAL DEFAULT 0.000000000 NOT NULL,
          paid_amount REAL DEFAULT 0.000000000 NOT NULL,
          paid_amount_after_tax REAL DEFAULT 0.000000000 NOT NULL,
          source_exchange_rate REAL DEFAULT 0.000000000 NOT NULL,
          base_paid_amount REAL DEFAULT 0.000000000 NOT NULL,
          base_paid_amount_after_tax REAL DEFAULT 0.000000000 NOT NULL,
          received_amount REAL DEFAULT 0.000000000 NOT NULL,
          received_amount_after_tax REAL DEFAULT 0.000000000 NOT NULL,
          target_exchange_rate REAL DEFAULT 0.000000000 NOT NULL,
          base_received_amount REAL DEFAULT 0.000000000 NOT NULL,
          base_received_amount_after_tax REAL DEFAULT 0.000000000 NOT NULL,
          total_allocated_amount REAL DEFAULT 0.000000000 NOT NULL,
          base_total_allocated_amount REAL DEFAULT 0.000000000 NOT NULL,
          unallocated_amount REAL DEFAULT 0.000000000 NOT NULL,
          difference_amount REAL DEFAULT 0.000000000 NOT NULL,
          purchase_taxes_and_charges_template TEXT NULL,
          sales_taxes_and_charges_template TEXT NULL,
          apply_tax_withholding_amount INTEGER DEFAULT 0 NOT NULL,
          tax_withholding_category TEXT NULL,
          base_total_taxes_and_charges REAL DEFAULT 0.000000000 NOT NULL,
          total_taxes_and_charges REAL DEFAULT 0.000000000 NOT NULL,
          reference_no TEXT NULL,
          reference_date DATE NULL,
          clearance_date DATE NULL,
          project TEXT NULL,
          cost_center TEXT NULL,
          status TEXT DEFAULT 'Draft' NULL,
          custom_remarks INTEGER DEFAULT 0 NOT NULL,
          remarks TEXT NULL,
          base_in_words TEXT NULL,
          is_opening TEXT DEFAULT 'No' NULL,
          letter_head TEXT NULL,
          print_heading TEXT NULL,
          bank TEXT NULL,
          bank_account_no TEXT NULL,
          payment_order TEXT NULL,
          in_words TEXT NULL,
          auto_repeat TEXT NULL,
          amended_from TEXT NULL,
          title TEXT NULL,
          _user_tags TEXT NULL,
          _comments TEXT NULL,
          _assign TEXT NULL,
          _liked_by TEXT NULL
        );

        CREATE TABLE IF NOT EXISTS Payment_Reference_Entry (
          name TEXT NOT NULL PRIMARY KEY,
          creation DATETIME NULL,
          modified DATETIME NULL,
          modified_by TEXT NULL,
          owner TEXT NULL,
          docstatus INTEGER DEFAULT 0 NOT NULL,
          idx INTEGER DEFAULT 0 NOT NULL,
          reference_doctype TEXT NULL,
          reference_name TEXT NULL,
          due_date DATE NULL,
          bill_no TEXT NULL,
          payment_term TEXT NULL,
          account_type TEXT NULL,
          payment_type TEXT NULL,
          total_amount REAL DEFAULT 0.000000000 NOT NULL,
          outstanding_amount REAL DEFAULT 0.000000000 NOT NULL,
          allocated_amount REAL DEFAULT 0.000000000 NOT NULL,
          exchange_rate REAL DEFAULT 0.000000000 NOT NULL,
          exchange_gain_loss REAL DEFAULT 0.000000000 NOT NULL,
          account TEXT NULL,
          parent TEXT NULL,
          parentfield TEXT NULL,
          parenttype TEXT NULL
        );
      
        CREATE TABLE IF NOT EXISTS Delivery_Note_Item (
          name TEXT NOT NULL PRIMARY KEY,
          creation DATETIME NULL,
          modified DATETIME NULL,
          modified_by TEXT NULL,
          owner TEXT NULL,
          docstatus INTEGER DEFAULT 0 NOT NULL,
          idx INTEGER DEFAULT 0 NOT NULL,
          barcode TEXT NULL,
          has_item_scanned INTEGER DEFAULT 0 NOT NULL,
          item_code TEXT NULL,
          item_name TEXT NULL,
          customer_item_code TEXT NULL,
          description TEXT NULL,
          brand TEXT NULL,
          item_group TEXT NULL,
          image TEXT NULL,
          qty REAL DEFAULT 0.000000000 NOT NULL,
          stock_uom TEXT NULL,
          uom TEXT NULL,
          conversion_factor REAL DEFAULT 0.000000000 NOT NULL,
          stock_qty REAL DEFAULT 0.000000000 NOT NULL,
          returned_qty REAL DEFAULT 0.000000000 NOT NULL,
          price_list_rate REAL DEFAULT 0.000000000 NOT NULL,
          base_price_list_rate REAL DEFAULT 0.000000000 NOT NULL,
          margin_type TEXT NULL,
          margin_rate_or_amount REAL DEFAULT 0.000000000 NOT NULL,
          rate_with_margin REAL DEFAULT 0.000000000 NOT NULL,
          discount_percentage REAL DEFAULT 0.000000000 NOT NULL,
          discount_amount REAL DEFAULT 0.000000000 NOT NULL,
          base_rate_with_margin REAL DEFAULT 0.000000000 NOT NULL,
          rate REAL DEFAULT 0.000000000 NOT NULL,
          amount REAL DEFAULT 0.000000000 NOT NULL,
          base_rate REAL DEFAULT 0.000000000 NOT NULL,
          base_amount REAL DEFAULT 0.000000000 NOT NULL,
          pricing_rules TEXT NULL,
          stock_uom_rate REAL DEFAULT 0.000000000 NOT NULL,
          is_free_item INTEGER DEFAULT 0 NOT NULL,
          grant_commission INTEGER DEFAULT 0 NOT NULL,
          net_rate REAL DEFAULT 0.000000000 NOT NULL,
          net_amount REAL DEFAULT 0.000000000 NOT NULL,
          item_tax_template TEXT NULL,
          base_net_rate REAL DEFAULT 0.000000000 NOT NULL,
          base_net_amount REAL DEFAULT 0.000000000 NOT NULL,
          billed_amt REAL DEFAULT 0.000000000 NOT NULL,
          incoming_rate REAL DEFAULT 0.000000000 NOT NULL,
          weight_per_unit REAL DEFAULT 0.000000000 NOT NULL,
          total_weight REAL DEFAULT 0.000000000 NOT NULL,
          weight_uom TEXT NULL,
          warehouse TEXT NULL,
          target_warehouse TEXT NULL,
          quality_inspection TEXT NULL,
          allow_zero_valuation_rate INTEGER DEFAULT 0 NOT NULL,
          against_sales_order TEXT NULL,
          so_detail TEXT NULL,
          against_sales_invoice TEXT NULL,
          si_detail TEXT NULL,
          dn_detail TEXT NULL,
          pick_list_item TEXT NULL,
          serial_and_batch_bundle TEXT NULL,
          use_serial_batch_fields INTEGER DEFAULT 0 NOT NULL,
          serial_no TEXT NULL,
          batch_no TEXT NULL,
          actual_batch_qty REAL DEFAULT 0.000000000 NOT NULL,
          actual_qty REAL DEFAULT 0.000000000 NOT NULL,
          installed_qty REAL DEFAULT 0.000000000 NOT NULL,
          item_tax_rate TEXT NULL,
          packed_qty REAL DEFAULT 0.000000000 NOT NULL,
          received_qty REAL DEFAULT 0.000000000 NOT NULL,
          expense_account TEXT NULL,
          material_request TEXT NULL,
          purchase_order TEXT NULL,
          purchase_order_item TEXT NULL,
          material_request_item TEXT NULL,
          cost_center TEXT NULL,
          project TEXT NULL,
          page_break INTEGER DEFAULT 0 NOT NULL,
          parent TEXT NULL,
          parentfield TEXT NULL,
          parenttype TEXT NULL
        );

        CREATE TABLE IF NOT EXISTS sales_order_logs(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT,
          name TEXT,
          state TEXT,
          data TEXT
        );

        CREATE TABLE IF NOT EXISTS payment_entry_logs(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT,
          name TEXT,
          associatedSaleOrder TEXT,
          state TEXT,
          data TEXT
        );

        CREATE TABLE IF NOT EXISTS delivery_note_logs(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT,
          name TEXT,
          state TEXT,
          data TEXT
        );

        CREATE TABLE IF NOT EXISTS User_Profile(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          company TEXT,
          warehouse TEXT,
          country TEXT,
          currency TEXT,
          default_cash_account TEXT,
          default_receivable_account TEXT
        );

        CREATE TABLE IF NOT EXISTS CustomerMetadata (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data_hash TEXT
        );

        INSERT INTO CustomerMetadata (data_hash) VALUES ("");

        CREATE TABLE IF NOT EXISTS DeliveryMetadata (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data_hash TEXT
        );

        INSERT INTO DeliveryMetadata (data_hash) VALUES ("");


        CREATE TABLE IF NOT EXISTS TaxesMetadata (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data_hash TEXT
        );

        INSERT INTO TaxesMetadata (data_hash) VALUES ("");


    `); // TODOD CREATE METADATA TABLES

    // INSERT OR REPLACE INTO CustomerMetadata (id, data_hash) VALUES (1, "");

    
    console.log('Database initialized');
  }catch(error){
    console.log("Error initializing database",error);
  }
}


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const checkLoginStatus = async () => {
    try {
      const storedLoginStatus = await AsyncStorage.getItem('isLoggedIn');
      startTransition(() => {
        if (storedLoginStatus === 'true') {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      });
    } catch (error) {
      console.error('Error checking login status:', error);
      startTransition(() => {
        setIsLoggedIn(false);
      });
    }
  };

  const handleLogin = async () => {
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      startTransition(() => {
        setIsLoggedIn(true);
      });
    } catch (error) {
      console.error('Error saving login status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('reference');
      await AsyncStorage.removeItem('verifCode');

      startTransition(() => {
        setIsLoggedIn(false);
      });
    } catch (error) {
      console.error('Error clearing login status:', error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const Tab = createBottomTabNavigator();

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    // <GestureHandlerRootView>
    <SyncProvider>
    <BudgetProvider>
    <SQLiteProvider databaseName='myDB.db' onInit={initDatabase}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{
          tabBarStyle: { backgroundColor:'#284979', borderTopLeftRadius:15 , borderTopRightRadius:15 },
        }}>
          <Tab.Screen name="Home" component={HomeNavigation} options={{
            headerShown:false,
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
          <Tab.Screen name="SettingsScreen" component={SettingsScreen} options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <AntDesign name="setting" size={24} color="white" />
              </View>
            ),
            tabBarOptions: {
              activeTintColor: '#284979',
              inactiveTintColor: '#FFFFFF',
            },
            }}/>
            <Tab.Screen
              name="Profile"
              options={{
                tabBarIcon: ({ focused }) => (
                  <View>
                    <Ionicons name="person" size={24} color="white" />
                  </View>
                ),
              tabBarOptions: {
                activeTintColor: '#284979',
                inactiveTintColor: '#FFFFFF',
              },
              }}
            >
              {() => <ProfileScreen handleLogout={handleLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
    </BudgetProvider>
    </SyncProvider>
    // </GestureHandlerRootView>
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