import { supabase } from './db';
import { encrypt } from './encryption';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');

    // Test 1: Check if we can query the companies table
    console.log('\n1. Testing table access...');
    const { count, error: tableError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    if (tableError) throw tableError;
    console.log('✓ Successfully accessed companies table');
    console.log('Current company count:', count);

    // Test 2: Insert a test company
    console.log('\n2. Testing company insertion...');
    const testCompany = {
      company_name: encrypt('Test Company A/S'),
      cvr: encrypt('12345678'),
      employees: 42,
      contact_person: encrypt('John Doe'),
      email: encrypt('john@testcompany.dk'),
      status: 'PENDING',
      ip_address: '127.0.0.1',
      user_agent: 'Test Script'
    };

    const { data: insertedCompany, error: insertError } = await supabase
      .from('companies')
      .insert([testCompany])
      .select()
      .single();

    if (insertError) throw insertError;
    console.log('✓ Successfully inserted test company');
    console.log('Inserted company ID:', insertedCompany.id);

    // Test 3: Update company status
    console.log('\n3. Testing status update...');
    const { error: updateError } = await supabase
      .from('companies')
      .update({ status: 'PROCESSING' })
      .eq('id', insertedCompany.id);

    if (updateError) throw updateError;
    console.log('✓ Successfully updated company status');

    console.log('\n✅ All database tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection().catch(console.error);