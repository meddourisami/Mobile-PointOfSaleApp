import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome6 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';

const HomeScreen = () => {
  const navigation = useNavigation();
  const db = useSQLiteContext();

  const initializeDatabase = async () => {
    try{
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Customer(
          name TEXT PRIMARY KEY NOT NULL,
          owner TEXT,
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          docstatus INTEGER,
          idx INTEGER,
          naming_series TEXT,
          salutation TEXT,
          customer_name TEXT,
          customer_type TEXT,
          customer_group TEXT,
          territory TEXT,
          gender TEXT,
          lead_name TEXT,
          opportunity_name TEXT,
          account_manager TEXT,
          image TEXT,
          default_currency TEXT,
          default_bank_account TEXT,
          default_price_list TEXT,
          is_internal_customer BOOLEAN,
          represents_company BOOLEAN,
          market_segment TEXT,
          industry TEXT,
          customer_pos_id TEXT,
          website TEXT,
          language TEXT,
          customer_details TEXT,
          customer_primary_address TEXT,
          primary_address TEXT,
          customer_primary_contact TEXT,
          mobile_no TEXT,
          email_id TEXT,
          tax_id TEXT,
          tax_category TEXT,
          tax_withholding_category TEXT,
          payment_terms TEXT,
          loyalty_program TEXT,
          loyalty_program_tier TEXT,
          default_sales_partner TEXT,
          default_commission_rate REAL,
          so_required BOOLEAN,
          dn_required BOOLEAN,
          is_frozen BOOLEAN,
          disabled BOOLEAN,
          _comment_count INTEGER
        );

        CREATE TABLE IF NOT EXISTS POS_Invoice (
          name TEXT PRIMARY KEY,
          owner TEXT,
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          docstatus INTEGER,
          idx INTEGER,
          title TEXT,
          naming_series TEXT,
          customer_name TEXT,
          tax_id TEXT,
          pos_profile TEXT,
          consolidated_invoice TEXT,
          is_pos INTEGER,
          is_return INTEGER,
          update_billed_amount_in_sales_order INTEGER,
          update_billed_amount_in_delivery_note INTEGER,
          company TEXT,
          posting_date DATE,
          posting_time TIME,
          set_posting_time INTEGER,
          due_date DATE,
          amended_from TEXT,
          return_against TEXT,
          project TEXT,
          cost_center TEXT,
          po_no TEXT,
          po_date DATE,
          customer_address TEXT,
          address_display TEXT,
          contact_person TEXT,
          contact_display TEXT,
          contact_mobile TEXT,
          contact_email TEXT,
          territory TEXT,
          shipping_address_name TEXT,
          shipping_address TEXT,
          company_address TEXT,
          company_address_display TEXT,
          currency TEXT,
          conversion_rate FLOAT,
          selling_price_list TEXT,
          price_list_currency TEXT,
          plc_conversion_rate FLOAT,
          ignore_pricing_rule INTEGER,
          set_warehouse TEXT,
          update_stock INTEGER,
          scan_barcode TEXT,
          total_billing_amount FLOAT,
          total_qty FLOAT,
          base_total FLOAT,
          base_net_total FLOAT,
          total FLOAT,
          net_total FLOAT,
          total_net_weight FLOAT,
          taxes_and_charges TEXT,
          shipping_rule TEXT,
          tax_category TEXT,
          other_charges_calculation TEXT,
          base_total_taxes_and_charges REAL,
          total_taxes_and_charges REAL,
          loyalty_points INTEGER,
          loyalty_amount FLOAT,
          redeem_loyalty_points INTEGER,
          loyalty_program TEXT,
          loyalty_redemption_account TEXT,
          loyalty_redemption_cost_center TEXT,
          coupon_code TEXT,
          apply_discount_on TEXT,
          base_discount_amount FLOAT,
          additional_discount_percentage FLOAT,
          discount_amount FLOAT,
          base_grand_total FLOAT,
          base_rounding_adjustment FLOAT,
          base_rounded_total FLOAT,
          base_in_words TEXT,
          grand_total FLOAT,
          rounding_adjustment FLOAT,
          rounded_total FLOAT,
          in_words TEXT,
          total_advance FLOAT,
          outstanding_amount FLOAT,
          allocate_advances_automatically INTEGER,
          payment_terms_template TEXT,
          cash_bank_account TEXT,
          base_paid_amount FLOAT,
          paid_amount FLOAT,
          base_change_amount FLOAT,
          change_amount FLOAT,
          account_for_change_amount TEXT,
          write_off_amount FLOAT,
          base_write_off_amount FLOAT,
          write_off_outstanding_amount_automatically INTEGER,
          write_off_account TEXT,
          write_off_cost_center TEXT,
          tc_name TEXT,
          terms TEXT,
          letter_head TEXT,
          group_same_items INTEGER,
          language TEXT,
          select_print_heading TEXT,
          inter_company_invoice_reference TEXT,
          customer_group TEXT,
          campaign TEXT,
          is_discounted INTEGER,
          status TEXT,
          source TEXT,
          debit_to TEXT,
          party_account_currency TEXT,
          is_opening TEXT,
          remarks TEXT,
          sales_partner TEXT,
          amount_eligible_for_commission FLOAT,
          commission_rate FLOAT,
          total_commission FLOAT,
          from_date DATE,
          to_date DATE,
          auto_repeat TEXT,
          against_income_account TEXT,
          FOREIGN KEY (customer_name) REFERENCES Customer(name)
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
          _liked_by TEXT, -- Liked by
          _seen TEXT, -- Seen
          FOREIGN KEY (customer) REFERENCES Customer(name)
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
          parenttype TEXT,
          FOREIGN KEY (parent) REFERENCES Sales_Invoice(name)
        );

        CREATE TABLE IF NOT EXISTS Item (
          id TEXT PRIMARY KEY,
          name TEXT,
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
          FOREIGN KEY (item_code) REFERENCES Quotation_Item(item_code) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (item_code) REFERENCES Sales_Invoice_Item(item_code) ON DELETE CASCADE ON UPDATE CASCADE
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
          parenttype TEXT, -- Parent type
          FOREIGN KEY (parent) REFERENCES Sales_Invoice(name)
        );

        CREATE TABLE IF NOT EXISTS POS_Invoice_Item (
          name TEXT PRIMARY KEY,
          item_id TEXT, -- Reference to tabItem.id
          owner TEXT,
          creation DATETIME,
          modified DATETIME,
          modified_by TEXT,
          docstatus INTEGER,
          idx INTEGER,
          barcode TEXT,
          has_item_scanned INTEGER,
          item_code TEXT,
          item_name TEXT,
          customer_item_code TEXT,
          description TEXT,
          item_group TEXT,
          brand TEXT,
          image TEXT,
          qty REAL,
          stock_uom TEXT,
          uom TEXT,
          conversion_factor REAL,
          stock_qty REAL,
          price_list_rate REAL,
          base_price_list_rate REAL,
          margin_type TEXT,
          margin_rate_or_amount REAL,
          rate_with_margin REAL,
          discount_percentage REAL,
          discount_amount REAL,
          base_rate_with_margin REAL,
          rate REAL,
          amount REAL,
          item_tax_template TEXT,
          base_rate REAL,
          base_amount REAL,
          pricing_rules TEXT,
          is_free_item INTEGER,
          grant_commission INTEGER,
          net_rate REAL,
          net_amount REAL,
          base_net_rate REAL,
          base_net_amount REAL,
          delivered_by_supplier INTEGER,
          income_account TEXT,
          is_fixed_asset INTEGER,
          asset TEXT,
          finance_book TEXT,
          expense_account TEXT,
          deferred_revenue_account TEXT,
          service_stop_date DATE,
          enable_deferred_revenue INTEGER,
          service_start_date DATE,
          service_end_date DATE,
          weight_per_unit REAL,
          total_weight REAL,
          weight_uom TEXT,
          warehouse TEXT,
          target_warehouse TEXT,
          quality_inspection TEXT,
          serial_and_batch_bundle TEXT,
          use_serial_batch_fields INTEGER,
          allow_zero_valuation_rate INTEGER,
          item_tax_rate TEXT,
          actual_batch_qty REAL,
          actual_qty REAL,
          serial_no TEXT,
          batch_no TEXT,
          sales_order TEXT,
          so_detail TEXT,
          pos_invoice_item TEXT,
          delivery_note TEXT,
          dn_detail TEXT,
          delivered_qty REAL,
          cost_center TEXT,
          project TEXT,
          page_break INTEGER,
          parent TEXT,
          parentfield TEXT,
          parenttype TEXT,
          FOREIGN KEY (item_id) REFERENCES Item(id),
          FOREIGN KEY (parent) REFERENCES POS_Invoice(name)
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
          parenttype TEXT,
          FOREIGN KEY (parent) REFERENCES Sales_Invoice(name) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (parent) REFERENCES POS_Invoice(name) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY(parent) REFERENCES Sales_Order(name) ON DELETE CASCADE ON UPDATE CASCADE
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
          parenttype TEXT,
          FOREIGN KEY (parent) REFERENCES Quotation(name) ON DELETE CASCADE ON UPDATE CASCADE
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
          base_in_words TEXT,
          grand_total REAL DEFAULT 0.0 NOT NULL,
          rounding_adjustment REAL DEFAULT 0.0 NOT NULL,
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
          against_blanket_order TEXT,
          FOREIGN KEY(parent) REFERENCES Sales_Order(name),
          FOREIGN KEY(item_code) REFERENCES Item(item_code)
        );
      `);
      console.log("Database initialized successfully");
    } catch(e){
      console.log("Error initializing database",e);
    }
  };



  const destroyDatabase = async() => {
    try{
      await db.execAsync(`
        DROP TABLE IF EXISTS Customer;
        DROP TABLE IF EXISTS Item;
        DROP TABLE IF EXISTS POS_Invoice;
        DROP TABLE IF EXISTS Sales_invoice;
        DROP TABLE IF EXISTS Pos_Invoice_Item;
        DROP TABLE IF EXISTS Sales_Invoice_Item;
        DROP TABLE IF EXISTS Sales_Taxes_and_Charges;
        DROP TABLE IF EXISTS Sales_Invoice_Payment;
        DROP TABLE IF EXISTS Quotation;
        DROP TABLE IF EXISTS Quotation_Item;
        DROP TABLE IF EXISTS Sales_Order;
        DROP TABLE IF EXISTS Sales_Order_Item;
      `);
      console.log("database reset success");
    }catch(e){
      console.log("error deleting database", e);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity style={styles.budgetButton} title="Budget">
          <Text style={styles.budgetText}>Budget</Text>
          <View style={styles.budgetRow}>
            <TouchableOpacity activeOpacity={"#E59135"} style={{backgroundColor:'#FFFFFF', height:50, width:100, marginRight:20, borderRadius:10, alignItems:'center', justifyContent:'center'}}>
              <Text style={{alignItems:'center', justifyContent:'center'}}>Bon de Commande</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:"#FFFFFF", height:50, width:100, borderRadius:10, alignItems:'center', justifyContent:'center'}}>
              <Text>Bon de Livraison</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{flexDirection:'row', borderRadius: 10, justifyContent: 'space-between'}}>
        <TouchableOpacity style={{marginLeft:30, borderRadius: 5 , backgroundColor: '#284979',justifyContent: 'center',alignItems: 'center', height:35, width:100}} onPress={initializeDatabase} >
          <Text style={{color:'#FFF'}}>Init Database</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{marginRight:47, borderRadius: 5,  backgroundColor: '#284979',justifyContent: 'center',alignItems: 'center', height:35, width:100}} onPress={destroyDatabase}>
          <Text style={{color:'#FFF'}}>Reset Database</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Client" onPress={() => navigation.navigate('ClientScreen')}>
            <FontAwesome6 name="people-group" size={50} color="white" />
            <Text style={styles.buttonText}>Clients</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Bon de Commande" onPress={() => navigation.navigate('CommandeScreen')}>
          <FontAwesome6 name="file-invoice-dollar" size={50} color="white" />
          <Text style={styles.buttonText}>Bon de Commande</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Article" onPress={() => navigation.navigate('ArticleScreen')}>
          <FontAwesome6 name="box-open" size={50} color="white" />
          <Text style={styles.buttonText}>Article</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Stock" onPress={() => navigation.navigate('StockScreen')}>
          <MaterialCommunityIcons name="truck-cargo-container" size={50} color="white" />
          <Text style={styles.buttonText}>Stock</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Livraison" onPress={() => navigation.navigate('LivraisonScreen')}>
          <AntDesign name="filetext1" size={50} color="white" />
          <Text style={styles.buttonText}>Bon de Livraison</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Bon de Paiment" onPress={() => navigation.navigate('PaimentScreen')}>
          <FontAwesome5 name="donate" size={50} color="white" />
          <Text style={styles.buttonText}>Paiment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingLeft: 20,
  },
  row: {
    marginLeft: 25,
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between'
  },
  buttonContainer: {
    flex: 1,
    margin: 5,
  },
  button:{
    backgroundColor: '#284979',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  buttonText:{
    color: '#fff',
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  budgetButton:{
    backgroundColor: '#284979',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    marginLeft: 30,
    marginBottom: 10,
    marginRight: 47,
  },
  budgetText:{
    color:'#FFFFFF',
    fontWeight:'bold',
  },
  budgetRow:{
    flexDirection: 'row',
    justifyContent:'space-between',
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
  },
})