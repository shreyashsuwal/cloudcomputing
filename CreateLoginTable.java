package samples;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.amazonaws.services.dynamodbv2.model.ScalarAttributeType;

import java.util.Arrays;

public class CreateLoginTable {
    public static void main(String[] args) {
        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
                .withRegion(Regions.US_EAST_1) // Specify the region here
                .build();
        DynamoDB dynamoDB = new DynamoDB(client);
        String tableName = "login";
        int readCapacityUnits = 10;
        int writeCapacityUnits = 10;

        // Convert int values to Long
        Long readCapacityUnitsLong = (long) readCapacityUnits;
        Long writeCapacityUnitsLong = (long) writeCapacityUnits;

        // Create the table
        try {
            System.out.println("Attempting to create table; please wait...");
            Table table = dynamoDB.createTable(tableName,
                    Arrays.asList(new KeySchemaElement("email", "HASH")), // Partition key
                    Arrays.asList(new AttributeDefinition("email", "S")),
                    new ProvisionedThroughput(readCapacityUnitsLong, writeCapacityUnitsLong)); // Use Long values
            table.waitForActive();
            System.out.println("Table created successfully. Status: " + table.getDescription().getTableStatus());
        } catch (Exception e) {
            System.err.println("Unable to create table: ");
            System.err.println(e.getMessage());
            return; // Exit the program if table creation fails
        }

        // If table creation is successful, proceed with putting items into the table
        Table table = dynamoDB.getTable(tableName);

        for (int i = 0; i < 10; i++) {
            String email = "s3980000" + i + "@student.rmit.edu.au";
            String userName = "Firstname Lastname" + i;
            String password = "012345"; // example password;


            Item item = new Item()
                    .withPrimaryKey("email", email)
                    .withString("user_name", userName)
                    .withString("password", password);
            table.putItem(item);
        }
    }
}
