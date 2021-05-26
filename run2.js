<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SFMC Custom Scripts Installer</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous">
    <style>
        
    </style>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-gtEjrD/SeCtmISkJkNUaaKMoLD0//ElJ19smozuHV6z3Iehds+3Ulb9Bn9Plx0x4" crossorigin="anonymous"></script>
    <script>
        //Custom scripts 
    </script>
</head>
<body>
    <div class="container">
        <h1>SFMC Custom Scripts Installer</h1>
        <p>Created by <a href="https://www.linkedin.com/in/mateusz-bartkowiak-9b865165/" target="_blank">Mateusz Bartkowiak</a>. Reach out with bugs and requests.</p>
        <script runat="server">
        //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
        // 
        //  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
        //  NOT CONTROL.
        // 
        //
        // Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
        // documentation files (the 'Software'), to deal in the Software without restriction, including without limitation 
        // the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
        // and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
        // 
        // The above copyright notice and this permission notice shall be included in all copies or substantial portions 
        // of the Software.
        // 
        // THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
        // TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
        // THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
        // CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
        // DEALINGS IN THE SOFTWARE.
    
    
    
        // Copyright:   Mateusz Bartkowiak
        // Author:      Mateusz Bartkowiak, https://www.linkedin.com/in/mateusz-bartkowiak-9b865165/
        // Since:       2021
        // Version:     0.0.1
        // License:     MIT
        Platform.Load('Core', '1.1.5');
        var proxy = new Script.Util.WSProxy();
        var retrievableObjectData = {};
    
        if (!Platform.Request.GetFormField('formName')) {
            var businessUnitPickerHtml1 = buildHtmlBusinessUnitPicker();
            var businessUnitPickerHtml2 = buildHtmlBusinessUnitPicker();
        }
    
        if (Platform.Request.GetFormField('formName') == 'dataViewsBacklog') {
            try {
                runConfigDataViewsBacklogInstall();
            }
            catch(e) {
                Write(Stingify(e));
            }
        }

        if (Platform.Request.GetFormField('formName') == 'buAndUsersInventory') {
  
        }
    
        function runConfigDataViewsBacklogInstall() {
            var businessUnitsSelected = getFormSelectedBusinessUnits();    
            if (businessUnitsSelected.length > 0) {
                for (var i = 0; i < businessUnitsSelected.length; i ++) {
                    proxy = new Script.Util.WSProxy();
                    proxy.setClientId({ID: businessUnitsSelected[i]});
                    var cnf = initializeConfigDataViewsBacklog(businessUnitsSelected[i]);
                    createDataExtensionsFromConfig(cnf);
                    createQueriesFromConfig(cnf);
                    try {
                        createAutomationFromDefinition(cnf.automationDefinition);
                    }
                    catch(e) {
                        Write(Stringify(e));
                    }
                }
            }
        }



        function initializeConfigBuAndUsersInventory(bu, subdomain, clientId, clientSecret) {
            var config = {};
            config.ver = '_0_0_1';
            config.mid = '_' + bu;
            config.prefix = 'INV_';
            config.subdomain = subdomain;
            config.clientId = clientId;
            config.clientSecret = clientSecret;

            config.folders = {};
            config.folders.deFolder = getOrCreateFolder(config.prefix + 'DE' + config.mid + config.ver, 'dataextension');

            config.deDefinitions = {};
            config.deDefinitions.BusinessUnits = {
                Name: config.prefix + 'BusinessUnits' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'BusinessUnits' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'MID', FieldType:'Number', IsPrimaryKey:true, IsRequired: true},
                    { Name:'Name', FieldType:'Text', MaxLength:255},
                    { Name:'ParentID', FieldType:'Number' },
                    { Name:'AddedDate', FieldType:'Date', DefaultValue: 'Now()'}
                ]
            };
            config.deDefinitions.Users = {
                Name: config.prefix + 'Users' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Users' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'AccountUserID', FieldType:'Number', IsPrimaryKey:true, IsRequired: true},
                    { Name:'Name', FieldType:'Text', MaxLength:255},
                    { Name:'Email', FieldType:'EmailAddress'},
                    { Name:'UserId', FieldType:'Text', MaxLength:50},
                    { Name:'Id', FieldType:'Text', MaxLength:50},
                    { Name:'IsLocked', FieldType:'Boolean'},
                    { Name:'ActiveFlag', FieldType:'Boolean'},
                    { Name:'SalesForceID', FieldType:'Text', MaxLength:50},
                    { Name:'AddedDate', FieldType:'Date', DefaultValue: 'Now()'}
                ]
            };
        }
    
        function initializeConfigDataViewsBacklog(bu) {
            var config = {};
            config.ver = '_0_0_1';
            config.mid = '_' + bu;
            config.prefix = 'DV_';
    
            config.folders = {};
            config.folders.deFolder = getOrCreateFolder(config.prefix + 'DE' + config.mid + config.ver, 'dataextension');
            config.folders.queryFolder = getOrCreateFolder(config.prefix + 'QUERY' + config.mid + config.ver, 'queryactivity');
            config.folders.automationFolder = getOrCreateFolder(config.prefix + 'AUTOMATIONS' + config.mid + config.ver, 'automations');
    
            config.deDefinitions = {};
            config.deDefinitions.Bounce = {
                Name: config.prefix + 'Bounce' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Bounce' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'GUID', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true},
                    { Name:'AccountID', FieldType:'Number', IsRequired: true},
                    { Name:'OYBAccountID', FieldType:'Number'},
                    { Name:'JobID', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'ListID', FieldType:'Number', IsRequired: true },
                    { Name:'BatchID', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'SubscriberID', FieldType:'Number', IsRequired: true },
                    { Name:'SubscriberKey', FieldType:'Text', MaxLength:255, IsRequired: true },
                    { Name:'EventDate', FieldType:'Date', IsRequired: true },
                    { Name:'IsUnique', FieldType:'Boolean', IsRequired: true },
                    { Name:'Domain', FieldType:'Text', MaxLength:128, IsRequired: true },
                    { Name:'BounceSubcategoryID', FieldType:'Number', IsRequired: true },
                    { Name:'BounceSubcategory', FieldType:'Text', MaxLength:50 },
                    { Name:'BounceCategory', FieldType:'Text', MaxLength:50 },
                    { Name:'BounceType', FieldType:'Text', MaxLength:50 },
                    { Name:'BounceCategoryID', FieldType:'Number' },
                    { Name:'BounceTypeID', FieldType:'Number' },
                    { Name:'SMTPBounceReason', FieldType:'Text' },
                    { Name:'SMTPMessage', FieldType:'Text' },
                    { Name:'SMTPCode', FieldType:'Number' },
                    { Name:'TriggererSendDefinitionObjectID', FieldType:'Text', MaxLength:50 },
                    { Name:'TriggeredSendCustomerKey', FieldType:'Text', MaxLength:50 }
                ]
            };
            config.deDefinitions.BusinessUnitUnsubscribes = {
                Name: config.prefix + 'BusinessUnitUnsubscribes' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'BusinessUnitUnsubscribes' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'GUID', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true },
                    { Name:'BusinessUnitID', FieldType:'Number', IsRequired: true },
                    { Name:'SubscriberID', FieldType:'Number', IsRequired: true },
                    { Name:'SubscriberKey', FieldType:'Text', MaxLength:255 },
                    { Name:'UnsubDateUTC', FieldType:'Date', IsRequired: true },
                    { Name:'UnsubReason', FieldType:'Text', MaxLength:100 }
                ] 
            };
            config.deDefinitions.Click = {
                Name: config.prefix + 'Click' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Click' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'GUID', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true },
                    { Name:'AccountID', FieldType:'Number', IsRequired: true },
                    { Name:'OYBAccountID', FieldType:'Number' },
                    { Name:'JobID', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'ListID', FieldType:'Number', IsRequired: true },
                    { Name:'BatchID', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'SubscriberID', FieldType:'Number', IsRequired: true },
                    { Name:'SubscriberKey', FieldType:'Text', MaxLength:255, IsRequired: true },
                    { Name:'EventDate', FieldType:'Date', IsRequired: true },
                    { Name:'Domain', FieldType:'Text', MaxLength:128, IsRequired: true },
                    { Name:'URL', FieldType:'Text' },
                    { Name:'LinkName', FieldType:'Text' },
                    { Name:'LinkContent', FieldType:'Text' },
                    { Name:'IsUnique', FieldType:'Boolean' },
                    { Name:'TriggererSendDefinitionObjectID', FieldType:'Text', MaxLength:50 },
                    { Name:'TriggeredSendCustomerKey', FieldType:'Text', MaxLength:50 }
                ] 
            };
            config.deDefinitions.Complaint = {
                Name: config.prefix + 'Complaint' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Complaint' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'GUID', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true },
                    { Name:'AccountID', FieldType:'Number', IsRequired: true },
                    { Name:'OYBAccountID', FieldType:'Number' },
                    { Name:'JobID', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'ListID', FieldType:'Number', IsRequired: true },
                    { Name:'BatchID', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'SubscriberID', FieldType:'Number', IsRequired: true },
                    { Name:'SubscriberKey', FieldType:'Text', MaxLength:255, IsRequired: true },
                    { Name:'IsUnique', FieldType:'Boolean', IsRequired: true },
                    { Name:'EventDate', FieldType:'Date', IsRequired: true },
                    { Name:'Domain', FieldType:'Text', MaxLength:128, IsRequired: true }
                ] 
            };
            /*config.deDefinitions.Coupon = {
                Name: config.prefix + 'Coupon' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Coupon' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'ExternalKey', FieldType:'Text', MaxLength:36, IsPrimaryKey:true, IsRequired: true },
                    { Name:'Name', FieldType:'Text', MaxLength:128, IsRequired: true },
                    { Name:'Description', FieldType:'Text', IsRequired: true },
                    { Name:'BeginDate', FieldType:'Date' },
                    { Name:'ExpirationDate', FieldType:'Date' }
                ] 
            };
            config.deDefinitions.FTAF = {
                Name: config.prefix + 'FTAF' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'FTAF' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'GUID', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true },
                    { Name:'AccountID', FieldType:'Number', IsRequired: true },
                    { Name:'OYBAccountID', FieldType:'Number' },
                    { Name:'JobID', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'ListID', FieldType:'Number', IsRequired: true },
                    { Name:'BatchID', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'SubscriberID', FieldType:'Number', IsRequired: true },
                    { Name:'SubscriberKey', FieldType:'Text', MaxLength:255, IsRequired: true },
                    { Name:'TransactionTime', FieldType:'Date', IsRequired: true },
                    { Name:'Domain', FieldType:'Text', MaxLength:128, IsRequired: true },
                    { Name:'IsUnique', FieldType:'Boolean', IsRequired: true },
                    { Name:'TriggererSendDefinitionObjectID', FieldType:'Text', MaxLength:50 },
                    { Name:'TriggeredSendCustomerKey', FieldType:'Text', MaxLength:50 }
                ] 
            };*/
            config.deDefinitions.Job = {
                Name: config.prefix + 'Job' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Job' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'JobId', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true },
                    { Name:'EmailID', FieldType:'Number' },
                    { Name:'AccountID', FieldType:'Number' },
                    { Name:'AccountUserID', FieldType:'Number' },
                    { Name:'FromName', FieldType:'Text', MaxLength:130 },
                    { Name:'FromEmail', FieldType:'Text', MaxLength:100 },
                    { Name:'SchedTime', FieldType:'Date' },
                    { Name:'PickupTime', FieldType:'Date' },
                    { Name:'DeliveredTime', FieldType:'Date' },
                    { Name:'EventID', FieldType:'Text', MaxLength:50 },
                    { Name:'IsMultipart', FieldType:'Boolean', IsRequired: true },
                    { Name:'JobType', FieldType:'Text', MaxLength:50 },
                    { Name:'JobStatus', FieldType:'Text', MaxLength:50 },
                    { Name:'ModifiedBy', FieldType:'Number' },
                    { Name:'ModifiedDate', FieldType:'Date' },
                    { Name:'EmailName', FieldType:'Text', MaxLength:100 },
                    { Name:'EmailSubject', FieldType:'Text', MaxLength:200 },
                    { Name:'IsWrapped', FieldType:'Boolean', IsRequired: true },
                    { Name:'TestEmailAddr', FieldType:'Text', MaxLength:128 },
                    { Name:'Category', FieldType:'Text', MaxLength:100, IsRequired: true },
                    { Name:'BccEmail', FieldType:'Text', MaxLength:100 },
                    { Name:'OriginalSchedTime', FieldType:'Date' },
                    { Name:'CreatedDate', FieldType:'Date', IsRequired: true },
                    { Name:'CharacterSet', FieldType:'Text', MaxLength:50 },
                    { Name:'IPAddress', FieldType:'Text', MaxLength:50 },
                    { Name:'SalesForceTotalSubscriberCount', FieldType:'Number', IsRequired: true },
                    { Name:'SalesForceErrorSubscriberCount', FieldType:'Number', IsRequired: true },
                    { Name:'DeduplicateByEmail', FieldType:'Boolean', IsRequired: true },
                    { Name:'DynamicEmailSubject', FieldType:'Text' },
                    { Name:'SuppressTracking', FieldType:'Boolean', IsRequired: true },
                    { Name:'SendClassificationType', FieldType:'Text', MaxLength:50 },
                    { Name:'TriggeredSendCustomerKey', FieldType:'Text', MaxLength:50 },
                    { Name:'SendType', FieldType:'Text', MaxLength:128, IsRequired: true },
                    { Name:'SendClassification', FieldType:'Text', MaxLength:50 },
                    { Name:'ResolveLinksWithCurrentData', FieldType:'Boolean', IsRequired: true },
                    { Name:'EmailSendDefinition', FieldType:'Text', MaxLength:50 },
                    { Name:'TriggererSendDefinitionObjectID', FieldType:'Text', MaxLength:50 }
                ] 
            };
            config.deDefinitions.Journey = {
                Name: config.prefix + 'Journey' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Journey' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'VersionId', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true },
                    { Name:'JourneyId', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true },
                    { Name:'JourneyName', FieldType:'Text', MaxLength:100, IsRequired: true },
                    { Name:'VersionNumber', FieldType:'Number', IsRequired: true },
                    { Name:'CreatedDate', FieldType:'Date', IsRequired: true },
                    { Name:'LastPublishedDate', FieldType:'Date' },
                    { Name:'ModifiedDate', FieldType:'Date', IsRequired: true },
                    { Name:'JourneyStatus', FieldType:'Text', MaxLength:100, IsRequired: true }
                ]
            };
            config.deDefinitions.JourneyActivity = {
                Name: config.prefix + 'JourneyActivity' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'JourneyActivity' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name:'VersionId', FieldType:'Text', MaxLength:50, IsRequired: true },
                    { Name:'ActivityId', FieldType:'Text', MaxLength:50, IsPrimaryKey:true, IsRequired: true },
                    { Name:'ActivityName', FieldType:'Text', MaxLength:100 },
                    { Name:'ActivityExternalKey', FieldType:'Text', MaxLength:100, IsRequired: true },
                    { Name:'JourneyActivityObjectID', FieldType:'Text', MaxLength:50 },
                    { Name:'ActivityType', FieldType:'Text', MaxLength:256 }
                ] 
            };
            config.deDefinitions.ListSubscribers = {
                Name: config.prefix + 'ListSubscribers' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'ListSubscribers' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name: 'SubscriberID', FieldType: 'Number', IsRequired: true, IsPrimaryKey: true},
                    { Name: 'ListID', FieldType: 'Number', IsRequired: true, IsPrimaryKey: true},
                    { Name: 'AddedBy', FieldType: 'Number', IsRequired: true},
                    { Name: 'AddMethod', FieldType: 'Text', MaxLength: 17, IsRequired: true},
                    { Name: 'CreatedDate', FieldType: 'Date'},
                    { Name: 'DateUnsubscribed', FieldType: 'Date'},
                    { Name: 'EmailAddress', FieldType: 'EmailAddress'},
                    { Name: 'ListType', FieldType: 'Text', MaxLength: 17, IsRequired: true},
                    { Name: 'Status', FieldType: 'Text', MaxLength: 12},
                    { Name: 'SubscriberKey', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SubscriberType', FieldType: 'Text', MaxLength: 100}
                ] 
            };
            config.deDefinitions.Open = {
                Name: config.prefix + 'Open' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Open' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name: 'GUID', FieldType: 'Text', MaxLength: 36, IsRequired: true, IsPrimaryKey: true },
                    { Name: 'AccountID', FieldType: 'Number', IsRequired: true},
                    { Name: 'OYBAccountID', FieldType: 'Number'},
                    { Name: 'JobID', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'ListID', FieldType: 'Number', IsRequired: true},
                    { Name: 'BatchID', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'SubscriberID', FieldType: 'Number', IsRequired: true},
                    { Name: 'SubscriberKey', FieldType: 'Text', MaxLength: 255, IsRequired: true},
                    { Name: 'EventDate', FieldType: 'Date', IsRequired: true},
                    { Name: 'Domain', FieldType: 'Text', MaxLength: 128, IsRequired: true},
                    { Name: 'IsUnique', FieldType: 'Boolean'},
                    { Name: 'TriggererSendDefinitionObjectID', FieldType: 'Text', MaxLength: 36},
                    { Name: 'TriggeredSendCustomerKey', FieldType: 'Text', MaxLength: 36}
                ] 
            };
            config.deDefinitions.Sent = {
                Name: config.prefix + 'Sent' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Sent' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name: 'GUID', FieldType: 'Text', MaxLength: 36, IsRequired: true, IsPrimaryKey: true },
                    { Name: 'AccountID', FieldType: 'Number', IsRequired: true},
                    { Name: 'OYBAccountID', FieldType: 'Number'},
                    { Name: 'JobID', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'ListID', FieldType: 'Number', IsRequired: true},
                    { Name: 'BatchID', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'SubscriberID', FieldType: 'Number', IsRequired: true},
                    { Name: 'SubscriberKey', FieldType: 'Text', MaxLength: 255, IsRequired: true},
                    { Name: 'EventDate', FieldType: 'Date', IsRequired: true},
                    { Name: 'Domain', FieldType: 'Text', MaxLength: 128, IsRequired: true},
                    { Name: 'TriggererSendDefinitionObjectID', FieldType: 'Text', MaxLength: 36},
                    { Name: 'TriggeredSendCustomerKey', FieldType: 'Text', MaxLength: 36}
                ] 
            };
            config.deDefinitions.SMSMessageTracking = {
                Name: config.prefix + 'SMSMessageTracking' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'SMSMessageTracking' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name: 'MobileMessageTrackingID', FieldType: 'Text', MaxLength: 255, IsRequired: true, IsPrimaryKey: true },
                    { Name: 'EID', FieldType: 'Number'},
                    { Name: 'MID', FieldType: 'Number'},
                    { Name: 'Mobile', FieldType: 'Text', MaxLength: 15, IsRequired: true},
                    { Name: 'MessageID', FieldType: 'Number', IsRequired: true},
                    { Name: 'KeywordID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'CodeID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'ConversationID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'CampaignID', FieldType: 'Number'},
                    { Name: 'Sent', FieldType: 'Boolean', IsRequired: true},
                    { Name: 'Delivered', FieldType: 'Boolean'},
                    { Name: 'Unsub', FieldType: 'Boolean'},
                    { Name: 'OptIn', FieldType: 'Boolean'},
                    { Name: 'OptOut', FieldType: 'Boolean'},
                    { Name: 'Outbound', FieldType: 'Boolean'},
                    { Name: 'Inbound', FieldType: 'Boolean'},
                    { Name: 'CreateDateTime', FieldType: 'Date', IsRequired: true},
                    { Name: 'ModifiedDateTime', FieldType: 'Date', IsRequired: true},
                    { Name: 'ActionDateTime', FieldType: 'Date', IsRequired: true},
                    { Name: 'MessageText', FieldType: 'Text', MaxLength: 160},
                    { Name: 'IsTest', FieldType: 'Boolean'},
                    { Name: 'MobileMessageRecurrenceID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'ResponseToMobileMessageTrackingID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'IsValid', FieldType: 'Boolean'},
                    { Name: 'InvalidationCode', FieldType: 'Number'},
                    { Name: 'SendID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SendSplitID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SendSegmentID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SendJobID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SendGroupID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SendPersonID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SubscriberID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SubscriberKey', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SMSStandardStatusCodeId', FieldType: 'Number'},
                    { Name: 'Description', FieldType: 'Text', MaxLength: 4000},
                    { Name: 'Name', FieldType: 'Text', MaxLength: 255},
                    { Name: 'ShortCode', FieldType: 'Text', MaxLength: 255},
                    { Name: 'SharedKeyword', FieldType: 'Text', MaxLength: 255},
                    { Name: 'Ordinal', FieldType: 'Number'},
                    { Name: 'FromName', FieldType: 'Text', MaxLength: 11},
                    { Name: 'JBActivityID', FieldType: 'Text', MaxLength: 255},
                    { Name: 'JBDefinitionID', FieldType: 'Text', MaxLength: 255}
                ]
            };
            /*config.deDefinitions.SMSSubscriptionLog = {
                Name: config.prefix + 'SMSSubscriptionLog' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'SMSSubscriptionLog' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [] 
            };*/
            config.deDefinitions.Subscribers = {
                Name: config.prefix + 'Subscribers' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Subscribers' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name: 'SubscriberID', FieldType: 'Number', IsRequired: true, IsPrimaryKey: true},
                    { Name: 'DateUndeliverable', FieldType: 'Date'},
                    { Name: 'DateJoined', FieldType: 'Date'},
                    { Name: 'DateUnsubscribed', FieldType: 'Date'},
                    { Name: 'Domain', FieldType: 'Text', MaxLength: 255},
                    { Name: 'EmailAddress', FieldType: 'EmailAddress', IsRequired: true},
                    { Name: 'BounceCount', FieldType: 'Number', IsRequired: true},
                    { Name: 'SubscriberKey', FieldType: 'Text', MaxLength: 255, IsRequired: true},
                    { Name: 'SubscriberType', FieldType: 'Text', MaxLength: 100, IsRequired: true},
                    { Name: 'Status', FieldType: 'Text', MaxLength: 12},
                    { Name: 'Locale', FieldType: 'Number'}
                ] 
            };
            /*config.deDefinitions.SurveyResponse = {
                Name: config.prefix + 'SurveyResponse' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'SurveyResponse' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name: 'GUID', FieldType: 'Text', MaxLength: 36, IsRequired: true, IsPrimaryKey: true },
                    { Name: 'AccountID', FieldType: 'Number', IsRequired: true},
                    { Name: 'OYBAccountID', FieldType: 'Number'},
                    { Name: 'JobID', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'ListID', FieldType: 'Number', IsRequired: true},
                    { Name: 'BatchID', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'SubscriberID', FieldType: 'Number', IsRequired: true},
                    { Name: 'SubscriberKey', FieldType: 'Text', MaxLength: 255, IsRequired: true},
                    { Name: 'EventDate', FieldType: 'Date', IsRequired: true},
                    { Name: 'Domain', FieldType: 'Text', MaxLength: 128, IsRequired: true},
                    { Name: 'SurveyID', FieldType: 'Number', IsRequired: true},
                    { Name: 'SurveyName', FieldType: 'Text', MaxLength: 100, IsRequired: true},
                    { Name: 'IsUnique', FieldType: 'Boolean', IsRequired: true},
                    { Name: 'QuestionID', FieldType: 'Number', IsRequired: true},
                    { Name: 'QuestionName', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'Question', FieldType: 'Text', MaxLength: 4000, IsRequired: true},
                    { Name: 'AnswerID', FieldType: 'Number', IsRequired: true},
                    { Name: 'AnswerName', FieldType: 'Text', MaxLength: 4000},
                    { Name: 'Answer', FieldType: 'Text', MaxLength: 4000},
                    { Name: 'AnswerData', FieldType: 'Text', MaxLength: 4000}
                ] 
            };*/
            config.deDefinitions.Unsubscribe = {
                Name: config.prefix + 'Unsubscribe' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'Unsubscribe' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name: 'GUID', FieldType: 'Text', MaxLength: 36, IsRequired: true, IsPrimaryKey: true },
                    { Name: 'AccountID', FieldType: 'Number', IsRequired: true},
                    { Name: 'OYBAccountID', FieldType: 'Number'},
                    { Name: 'JobID', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'ListID', FieldType: 'Number', IsRequired: true},
                    { Name: 'BatchID', FieldType: 'Text', MaxLength: 50, IsRequired: true},
                    { Name: 'SubscriberID', FieldType: 'Number', IsRequired: true},
                    { Name: 'SubscriberKey', FieldType: 'Text', MaxLength: 255, IsRequired: true},
                    { Name: 'EventDate', FieldType: 'Date', IsRequired: true},
                    { Name: 'IsUnique', FieldType: 'Boolean', IsRequired: true},
                    { Name: 'Domain', FieldType: 'Text', MaxLength: 128, IsRequired: true}
                ] 
            };
            config.deDefinitions.RunWatermark = {
                Name: config.prefix + 'RunWatermark' + config.mid + config.ver, 
                CustomerKey: config.prefix + 'RunWatermark' + config.mid + config.ver, 
                CategoryID: config.folders.deFolder,
                Fields : [
                    { Name: 'GUID', FieldType: 'Text', MaxLength: 36, IsRequired: true, IsPrimaryKey: true },
                    { Name: 'RunTimestamp', FieldType: 'Date', IsRequired: true},
                    { Name: 'RunTimestampUTC', FieldType: 'Date', IsRequired: true}
                ] 
            };
    
            config.queryDefinitions = {};

            config.queryDefinitions.Bounce = {
                Name: config.prefix + 'Bounce' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Bounce' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Bounce.Name,
                    CustomerKey: config.deDefinitions.Bounce.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nNEWID() as GUID,\nb.AccountID,\nb.OYBAccountID,\nb.JobID,\nb.ListID,\nb.BatchID,\nb.SubscriberID,\nb.SubscriberKey,\nb.EventDate,\nb.IsUnique,\nb.Domain,\nb.BounceCategoryID,\nb.BounceCategory,\nb.BounceSubcategoryID,\nb.BounceSubcategory,\nb.BounceTypeID,\nb.BounceType,\nb.SMTPBounceReason,\nb.SMTPMessage,\nb.SMTPCode,\nb.TriggererSendDefinitionObjectID,\nb.TriggeredSendCustomerKey\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\n\tx.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\n\ty.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON \n\tslts.RowNumber = 2\nJOIN _Bounce b\n\tON (b.EventDate > slts.[RunTimestamp] AND b.EventDate <= lts.[RunTimestamp])\nWHERE lts.RowNumber = 1'
            }

            config.queryDefinitions.BusinessUnitUnsubscribes = {
                Name: config.prefix + 'BusinessUnitUnsubscribes' + config.mid + config.ver,
                CustomerKey: config.prefix + 'BusinessUnitUnsubscribes' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.BusinessUnitUnsubscribes.Name,
                    CustomerKey: config.deDefinitions.BusinessUnitUnsubscribes.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nNEWID() AS GUID,\nb.BusinessUnitId,\nb.SubscriberId,\nb.SubscriberKey,\nb.UnsubDateUTC,\nb.UnsubReason\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestampUTC] DESC) as RowNumber,\n\tx.[RunTimestampUTC]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestampUTC] DESC) as RowNumber,\n\ty.[RunTimestampUTC]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON \n\tslts.RowNumber = 2\nJOIN _BusinessUnitUnsubscribes b\n\tON (b.UnsubDateUTC > slts.[RunTimestampUTC] AND b.UnsubDateUTC <= lts.[RunTimestampUTC])\nWHERE lts.RowNumber = 1'
            }

            config.queryDefinitions.Click = {
                Name: config.prefix + 'Click' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Click' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Click.Name,
                    CustomerKey: config.deDefinitions.Click.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nNEWID() as GUID,\nc.AccountID,\nc.OYBAccountID,\nc.JobID,\nc.ListID,\nc.BatchID,\nc.SubscriberID,\nc.SubscriberKey,\nc.EventDate,\nc.Domain,\nc.URL,\nc.LinkName,\nc.LinkContent,\nc.IsUnique,\nc.TriggererSendDefinitionObjectID,\nc.TriggeredSendCustomerKey\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\n\tx.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\n\ty.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON \n\tslts.RowNumber = 2\nJOIN _Click c\n\tON (c.EventDate > slts.[RunTimestamp] AND c.EventDate <= lts.[RunTimestamp])\nWHERE lts.RowNumber = 1'
            }

            config.queryDefinitions.Complaint = {
                Name: config.prefix + 'Complaint' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Complaint' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Complaint.Name,
                    CustomerKey: config.deDefinitions.Complaint.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\tNEWID() as GUID,\tc.AccountID,\tc.OYBAccountID,\tc.JobID,\tc.ListID,\tc.BatchID,\tc.SubscriberID,\tc.SubscriberKey,\tc.EventDate,\tc.IsUnique,\tc.Domain\tFROM (\t\tSELECT DISTINCT\t\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\t\tx.[RunTimestamp]\t\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\t) lts\tJOIN (\t\tSELECT DISTINCT\t\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\t\ty.[RunTimestamp]\t\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\t) slts ON \t\tslts.RowNumber = 2\tJOIN _Complaint c\t\tON (c.EventDate > slts.[RunTimestamp] AND c.EventDate <= lts.[RunTimestamp])\tWHERE lts.RowNumber = 1'
            }

            //config.queryDefinitions.Coupon
            //config.queryDefinitions.FTAF

            config.queryDefinitions.Job = {
                Name: config.prefix + 'Job' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Job' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Job.Name,
                    CustomerKey: config.deDefinitions.Job.CustomerKey
                },
                QueryText: 'SELECT\nj.JobId,\nj.EmailID,\nj.AccountID,\nj.AccountUserID,\nj.FromName,\nj.FromEmail,\nj.SchedTime,\nj.PickupTime,\nj.DeliveredTime,\nj.EventID,\nj.IsMultipart,\nj.JobType,\nj.JobStatus,\nj.ModifiedBy,\nj.ModifiedDate,\nj.EmailName,\nj.EmailSubject,\nj.IsWrapped,\nj.TestEmailAddr,\nj.Category,\nj.BccEmail,\nj.OriginalSchedTime,\nj.CreatedDate,\nj.CharacterSet,\nj.IPAddress,\nj.SalesForceTotalSubscriberCount,\nj.SalesForceErrorSubscriberCount,\nj.SendType,\nj.DynamicEmailSubject,\nj.SuppressTracking,\nj.SendClassificationType,\nj.SendClassification,\nj.ResolveLinksWithCurrentData,\nj.EmailSendDefinition,\nj.DeduplicateByEmail,\nj.TriggererSendDefinitionObjectID,\nj.TriggeredSendCustomerKey\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\n\tx.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\n\ty.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON \n\tslts.RowNumber = 2\nJOIN _Job j\n\tON (j.ModifiedDate > slts.[RunTimestamp] AND j.ModifiedDate <= lts.[RunTimestamp])\n\tOR (j.CreatedDate > slts.[RunTimestamp] AND j.CreatedDate <= lts.[RunTimestamp])\n\tOR (j.OriginalSchedTime > slts.[RunTimestamp] AND j.OriginalSchedTime <= lts.[RunTimestamp])\nWHERE lts.RowNumber = 1'
            }

            config.queryDefinitions.Journey = {
                Name: config.prefix + 'Journey' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Journey' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Journey.Name,
                    CustomerKey: config.deDefinitions.Journey.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nj.VersionId,\nj.JourneyId,\nj.JourneyName,\nj.VersionNumber,\nj.CreatedDate,\nj.LastPublishedDate,\nj.ModifiedDate,\nj.JourneyStatus\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\n\tx.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\n\ty.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON \n\tslts.RowNumber = 2\nJOIN _Journey j\n\tON (j.ModifiedDate > slts.[RunTimestamp] AND j.ModifiedDate <= lts.[RunTimestamp])\n\tOR (j.CreatedDate > slts.[RunTimestamp] AND j.CreatedDate <= lts.[RunTimestamp])\n\tOR (j.LastPublishedDate > slts.[RunTimestamp] AND j.LastPublishedDate <= lts.[RunTimestamp])\nWHERE lts.RowNumber = 1'
            }

            config.queryDefinitions.JourneyActivity = {
                Name: config.prefix + 'JourneyActivity' + config.mid + config.ver,
                CustomerKey: config.prefix + 'JourneyActivity' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.JourneyActivity.Name,
                    CustomerKey: config.deDefinitions.JourneyActivity.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nj.VersionId,\nj.ActivityId,\nj.ActivityName,\nj.ActivityExternalKey,\nj.JourneyActivityObjectID,\nj.ActivityType\nFROM _JourneyActivity j\nWHERE NOT EXISTS (\n\tSELECT x.ActivityId FROM [' + config.deDefinitions.JourneyActivity.Name + '] x WHERE j.ActivityId = x.ActivityId\n)'
            }

            config.queryDefinitions.ListSubscribers = {
                Name: config.prefix + 'ListSubscribers' + config.mid + config.ver,
                CustomerKey: config.prefix + 'ListSubscribers' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.ListSubscribers.Name,
                    CustomerKey: config.deDefinitions.ListSubscribers.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nls.AddedBy,\nls.AddMethod,\nls.CreatedDate,\nls.DateUnsubscribed,\nls.EmailAddress,\nls.ListID,\nls.ListName,\nls.ListType,\nls.Status,\nls.SubscriberID,\nls.SubscriberKey,\nls.SubscriberType\nFROM _ListSubscribers ls\nLEFT JOIN [' + config.deDefinitions.ListSubscribers.Name + '] dtls\n\tON ls.ListId = dtls.ListId\n\tAND ls.SubscriberId = dtls.SubscriberId\nWHERE\n(ls.EmailAddress != dtls.EmailAddress)\nOR (dtls.SubscriberId IS NULL AND dtls.ListId IS NULL)\nOR (ls.Status != dtls.Status)\nOR (ls.SubscriberType != dtls.SubscriberType)\nOR (ls.DateUnsubscribed > dtls.DateUnsubscribed)\nOR (ls.DateUnsubscribed IS NOT NULL AND dtls.DateUnsubscribed IS NULL)'
            }
    
            config.queryDefinitions.Open = {
                Name: config.prefix + 'Open' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Open' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Open.Name,
                    CustomerKey: config.deDefinitions.Open.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nNEWID() as GUID,\no.AccountID,\no.OYBAccountID,\no.JobID,\no.ListID,\no.BatchID,\no.SubscriberID,\no.SubscriberKey,\no.EventDate,\no.Domain,\no.IsUnique,\no.TriggererSendDefinitionObjectID,\no.TriggeredSendCustomerKey\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\n\tx.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\n\ty.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON \n\tslts.RowNumber = 2\nJOIN _Open o\n\tON (o.EventDate > slts.[RunTimestamp] AND o.EventDate <= lts.[RunTimestamp])\nWHERE lts.RowNumber = 1'
            }

            config.queryDefinitions.Sent = {
                Name: config.prefix + 'Sent' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Sent' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Sent.Name,
                    CustomerKey: config.deDefinitions.Sent.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nNEWID() as GUID,\ns.AccountID,\ns.OYBAccountID,\ns.JobID,\ns.ListID,\ns.BatchID,\ns.SubscriberID,\ns.SubscriberKey,\ns.EventDate,\ns.Domain,\ns.TriggererSendDefinitionObjectID,\ns.TriggeredSendCustomerKey\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\n\tx.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\n\ty.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON \n\tslts.RowNumber = 2\nJOIN _Sent s\n\tON (s.EventDate > slts.[RunTimestamp] AND s.EventDate <= lts.[RunTimestamp])\nWHERE lts.RowNumber = 1'
            }
    
            config.queryDefinitions.SMSMessageTracking = {
                Name: config.prefix + 'SMSMessageTracking' + config.mid + config.ver,
                CustomerKey: config.prefix + 'SMSMessageTracking' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.SMSMessageTracking.Name,
                    CustomerKey: config.deDefinitions.SMSMessageTracking.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\ns.MobileMessageTrackingID,\ns.EID,\ns.MID,\ns.Mobile,\ns.MessageID,\ns.KeywordID,\ns.CodeID,\ns.ConversationID,\ns.CampaignID,\ns.Sent,\ns.Delivered,\ns.Undelivered,\ns.Unsub,\ns.OptIn,\ns.OptOut,\ns.Outbound,\ns.Inbound,\ns.CreateDateTime,\ns.ModifiedDateTime,\ns.ActionDateTime,\ns.MessageText,\ns.IsTest,\ns.MobileMessageRecurrenceID,\ns.ResponseToMobileMessageTrackingID,\ns.IsValid,\ns.InvalidationCode,\ns.SendID,\ns.SendSplitID,\ns.SendSegmentID,\ns.SendJobID,\ns.SendGroupID,\ns.SendPersonID,\ns.SubscriberID,\ns.SubscriberKey,\ns.SMSStandardStatusCodeId,\ns.Description,\ns.Name,\ns.ShortCode,\ns.SharedKeyword,\ns.Ordinal,\ns.FromName,\ns.JBActivityID,\ns.JBDefinitionID\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\n\tx.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\n\ty.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON \n\tslts.RowNumber = 2\nJOIN _SMSMessageTracking s\n\tON (s.CreateDateTime > slts.[RunTimestamp] AND s.CreateDateTime <= lts.[RunTimestamp])\n\tOR (s.ModifiedDateTime > slts.[RunTimestamp] AND s.ModifiedDateTime <= lts.[RunTimestamp])\n\tOR (s.ActionDateTime > slts.[RunTimestamp] AND s.ActionDateTime <= lts.[RunTimestamp])\nWHERE lts.RowNumber = 1'
            }
    
            config.queryDefinitions.Subscribers = {
                Name: config.prefix + 'Subscribers' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Subscribers' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Subscribers.Name,
                    CustomerKey: config.deDefinitions.Subscribers.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\ns.SubscriberId,\ns.DateUndeliverable,\ns.DateJoined,\ns.DateUnsubscribed,\ns.Domain,\ns.EmailAddress,\ns.BounceCount,\ns.SubscriberKey,\ns.SubscriberType,\ns.Status,\ns.Locale\nFROM _Subscribers s\nLEFT JOIN [' + config.deDefinitions.Subscribers.Name + '] dts\n\tON s.SubscriberId = dts.SubscriberId\nWHERE\n(dts.SubscriberId IS NULL)\nOR (s.EmailAddress != dts.EmailAddress)\nOR (s.Status != dts.Status)\nOR (s.Locale != dts.Locale)\nOR (s.BounceCount != dts.BounceCount)\nOR (s.SubscriberType != dts.SubscriberType)\nOR (s.DateUndeliverable > dts.DateUndeliverable)\nOR (s.DateUndeliverable IS NOT NULL AND dts.DateUndeliverable IS NULL)\nOR (s.DateJoined > dts.DateJoined)\nOR (s.DateJoined IS NOT NULL AND dts.DateJoined IS NULL)\nOR (s.DateUnsubscribed > dts.DateUnsubscribed)\nOR (s.DateUnsubscribed IS NOT NULL AND dts.DateUnsubscribed IS NULL)'
            }
    
            //config.queryDefinitions.SurveyResponse
            config.queryDefinitions.Unsubscribe = {
                Name: config.prefix + 'Unsubscribe' + config.mid + config.ver,
                CustomerKey: config.prefix + 'Unsubscribe' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.Unsubscribe.Name,
                    CustomerKey: config.deDefinitions.Unsubscribe.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nNEWID() as GUID,\nu.AccountID,\nu.OYBAccountID,\nu.JobID,\nu.ListID,\nu.BatchID,\nu.SubscriberID,\nu.SubscriberKey,\nu.EventDate,\nu.IsUnique,\nu.Domain\n\nFROM (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY x.[RunTimestamp] DESC) as RowNumber,\n\tx.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] x\n) lts\n\nJOIN (\n\tSELECT DISTINCT\n\tROW_NUMBER() OVER(ORDER BY y.[RunTimestamp] DESC) as RowNumber,\n\ty.[RunTimestamp]\n\tFROM [' + config.deDefinitions.RunWatermark.Name + '] y\n) slts ON slts.RowNumber = 2\n\nJOIN _Unsubscribe u ON \n\t(u.EventDate > slts.[RunTimestamp] AND u.EventDate <= lts.[RunTimestamp])\n\nWHERE lts.RowNumber = 1'
            }
    
            config.queryDefinitions.RunWatermark = {
                Name: config.prefix + 'RunWatermark' + config.mid + config.ver,
                CustomerKey: config.prefix + 'RunWatermark' + config.mid + config.ver,
                CategoryID: config.folders.queryFolder,
                TargetUpdateType : 'Update',
                TargetType : 'DE',
                DataExtensionTarget: {
                    Name: config.deDefinitions.RunWatermark.Name,
                    CustomerKey: config.deDefinitions.RunWatermark.CustomerKey
                },
                QueryText: 'SELECT DISTINCT\nNEWID() as GUID,\nGETDATE() as RunTimestamp,\nGETUTCDATE() as RunTimestampUTC'
            }
    
            config.automationDefinition = {};
            config.automationDefinition.Name = config.prefix + 'AUTOMATION' + config.mid + config.ver;
            config.automationDefinition.CustomerKey = config.prefix + 'AUTOMATION' + config.mid + config.ver;
            config.automationDefinition.CategoryID = config.folders.automationFolder;
            config.automationDefinition.AutomationType = 'scheduled';
            config.automationDefinition.AutomationTasks = [
                {
                    Name: 'Stores run Watermark',
                    Activities: [
                        { 
                            ActivityObject : {
                            	__Type__: 'QueryDefinition',
                            	Name: config.queryDefinitions.RunWatermark.Name,
                                CustomerKey: config.queryDefinitions.RunWatermark.CustomerKey
                            }, 
                            Name: config.queryDefinitions.RunWatermark.Name
                        }
                    ]
                },
                {
                    Description: 'Sent, Click, Open, Bounce',
                    Activities: [
                        { 
                            ActivityObject : {
                            	__Type__: 'QueryDefinition',
                            	Name: config.queryDefinitions.Sent.Name,
                                CustomerKey: config.queryDefinitions.Sent.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Sent.Name
                        },
                        { 
                            ActivityObject : {
                            	__Type__: 'QueryDefinition',
                            	Name: config.queryDefinitions.Click.Name,
                                CustomerKey: config.queryDefinitions.Click.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Click.Name
                        },
                        { 
                            ActivityObject : {
                            	__Type__: 'QueryDefinition',
                            	Name: config.queryDefinitions.Open.Name,
                                CustomerKey: config.queryDefinitions.Open.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Open.Name
                        },
                        { 
                            ActivityObject : {
                            	__Type__: 'QueryDefinition',
                            	Name: config.queryDefinitions.Bounce.Name,
                                CustomerKey: config.queryDefinitions.Bounce.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Bounce.Name
                        }
                    ]
                },
                {
                    Description: 'Complaint, Unsubscribes, Subscribers, ListSubscribers, BusinessUnitUnsubscribes',
                    Activities: [
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.Complaint.Name,
                                CustomerKey: config.queryDefinitions.Complaint.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Complaint.Name
                        },
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.Unsubscribe.Name,
                                CustomerKey: config.queryDefinitions.Unsubscribe.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Unsubscribe.Name
                        },
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.Subscribers.Name,
                                CustomerKey: config.queryDefinitions.Subscribers.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Subscribers.Name
                        },
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.ListSubscribers.Name,
                                CustomerKey: config.queryDefinitions.ListSubscribers.CustomerKey
                            }, 
                            Name: config.queryDefinitions.ListSubscribers.Name
                        },
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.BusinessUnitUnsubscribes.Name,
                                CustomerKey: config.queryDefinitions.BusinessUnitUnsubscribes.CustomerKey
                            }, 
                            Name: config.queryDefinitions.BusinessUnitUnsubscribes.Name
                        }
                    ]
                },
                {
                    Description: 'Job, Journey, JourneyActivit, SMSMessageTracking',
                    Activities: [
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.Job.Name,
                                CustomerKey: config.queryDefinitions.Job.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Job.Name
                        },
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.Journey.Name,
                                CustomerKey: config.queryDefinitions.Journey.CustomerKey
                            }, 
                            Name: config.queryDefinitions.Journey.Name
                        },
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.JourneyActivity.Name,
                                CustomerKey: config.queryDefinitions.JourneyActivity.CustomerKey
                            }, 
                            Name: config.queryDefinitions.JourneyActivity.Name
                        },
                        { 
                            ActivityObject : {
                                __Type__: 'QueryDefinition',
                                Name: config.queryDefinitions.SMSMessageTracking.Name,
                                CustomerKey: config.queryDefinitions.SMSMessageTracking.CustomerKey
                            }, 
                            Name: config.queryDefinitions.SMSMessageTracking.Name
                        }
                    ]
                }
            ];
            return config;
        }
    
    
        function getRootFolderId(type) {
            var lookup = proxy.retrieve('DataFolder', ['ID'], {
                LeftOperand: { Property: 'ContentType', SimpleOperator: 'equals', Value: type },
                LogicalOperator: 'AND',
                RightOperand: {Property: 'ParentFolder.Id', SimpleOperator: 'equals', Value: 0}
            });
            return lookup.Results[0].ID;
        }
    
    
        function getOrCreateFolder(name, type) {
            var rootFolderId = getRootFolderId(type);
            var lookup = proxy.retrieve('DataFolder', ['ID'], {
                LeftOperand: { Property: 'Name', SimpleOperator: 'equals', Value: name },
                LogicalOperator: 'AND',
                RightOperand: {
                    LeftOperand: { Property: 'ContentType', SimpleOperator: 'equals', Value: type },
                    LogicalOperator: 'AND',
                    RightOperand: {Property: 'ParentFolder.ID', SimpleOperator: 'equals', Value: rootFolderId}
                }
            });
    
            if (lookup.Results.length == 1 ) {
                Write('<br/><span class="badge bg-primary">Folder retrieved: ' + name + ', type: ' + type + '</span>');
                return lookup.Results[0].ID
            }
    
            else {
                var newFolder = proxy.createItem('DataFolder', {
                    Name: name,
                    ContentType: type,
                    Description: name,
                    IsActive: true,
                    IsEditable: true,
                    AllowChildren: true,
                    ParentFolder: {
                        ID: rootFolderId,
                        IDSpecified: true
                    }
                });
    
                if (newFolder.Results[0].NewID) {
                    Write('<br/><span class="badge bg-success">Folder created: ' + name + ', type: ' + type + '</span>');
                    return newFolder.Results[0].NewID;
                }
                else {
                    Write('<br/><span class="badge bg-danger">Folder failed to create: ' + name + ', type: ' + type + '</span>');
                }
            }
        }
    
    
        function createObjectFromDefinition(definition, type) {
            var exists = true;
            if (type != 'Automation') {
                exists = checkIfObjectExists(definition.Name, type)
            }
            if (!exists || type == 'Automation') {
    
                var obj = proxy.createItem(type, definition);
    
                if (obj.Results.length == 1 && obj.Status == 'OK') {

                    if (obj.Results[0].NewObjectID) {
                        retrievableObjectData[definition.Name + type] = obj.Results[0].NewObjectID;
                    }
                    
                    if (definition.Name.indexOf('Watermark') > -1 && type == 'DataExtension') {
                        addWatermarkRecord(definition.CustomerKey);
                    }
                    Write('<br/><span class="badge bg-success">' + type + ' created: ' + definition.Name + '</span>');
                }
                else if (type == 'Automation' && !obj.Results[0].NewObjectID) {
                    Write('<br/><span class="badge bg-warning text-dark">' + type + ' already exists: ' + definition.Name + '</span>');
                }
                else {
                    Write('<br/><span class="badge bg-danger">' + type + ' failed to create: ' + definition.Name + '</span><pre>' + Stringify(obj) + '</pre>');
                }
            }
            else {
                Write('<br/><span class="badge bg-warning text-dark">' + type + ' already exists: ' + definition.Name + '</span>');
            }
        }

        function createAutomationFromDefinition(definition) {
            for (var i = 0; i < definition.AutomationTasks.length; i ++) {
                for (var j = 0; j < definition.AutomationTasks[i].Activities.length; j ++) {
                    definition.AutomationTasks[i].Activities[j].ObjectID = retrievableObjectData[definition.AutomationTasks[i].Activities[j].Name + 'QueryDefinition'];
                    definition.AutomationTasks[i].Activities[j].ActivityObject.ObjectID = retrievableObjectData[definition.AutomationTasks[i].Activities[j].Name + 'QueryDefinition'];
                }
            }

            createObjectFromDefinition(definition, 'Automation');

        }
    
    
        function createDataExtensionsFromConfig(config) {
            for (var key in config.deDefinitions) {
                try {
                    createObjectFromDefinition(config.deDefinitions[key], 'DataExtension');
                }
                catch(e) {
                    Write('<br/><span class="badge bg-danger">DataExtension failed to create: ' + config.deDefinitions[key].Name + ', error: </span><pre>' + Stringify(e) + '</pre><br/>');
                }
            }
        }
    
        function createQueriesFromConfig(config) {
            for (var key in config.queryDefinitions) {
                try {
                    createObjectFromDefinition(config.queryDefinitions[key], 'QueryDefinition');
                }
                catch(e) {
                    Write('<br/><span class="badge bg-danger">QueryDefinition failed to create: ' + config.deDefinitions[key].Name + ', error: </span><pre>' + Stringify(e) + '</pre><br/>');
                }
            }
        }
    
    
        function checkIfObjectExists(name, type) {
            var output = false;
            var props = ['Name', 'CustomerKey', 'ObjectID'];
    
            var filter = {
                LeftOperand: { Property: 'Name', SimpleOperator: 'equals', Value: name },
                LogicalOperator: 'OR',
                RightOperand: {Property: 'CustomerKey', SimpleOperator: 'equals', Value: name}
            };
    
            var lookup = proxy.retrieve(type, props, filter);
    
            if (lookup.Results.length > 0) {

                retrievableObjectData[name + type] = lookup.Results[0].ObjectID;
                output = true;
            }
    
            return output;
    
        }
    
        function addWatermarkRecord(customerKey) {
            var today = new Date();
            var past = new Date();
            past.setDate(today.getDate() - 365);
    
            var row = [
                { Name: 'GUID', Value: Platform.Function.GUID()},
                { Name: 'RunTimestamp', Value: past },
                { Name: 'RunTimestampUTC', Value: past }
            ];
    
            proxy.createItem('DataExtensionObject', {
                CustomerKey: customerKey,
                Properties: row
            });
        }
    
    
        function buildHtmlBusinessUnitPicker() {
            var output = '';
            var r = Platform.Function.GUID();
            var businessUnits = getAllBusinessUnits();
            for (var mid in businessUnits) {
                output += '<div class="mb-3">';
                output += '    <div class="form-check">';
                output += '        <input class="form-check-input" type="checkbox" value="' + mid + '" id="businessUnit' + mid + r + '" name="businessUnit' + mid +'">';
                output += '        <label class="form-check-label" for="businessUnit' + mid + r + '">';
                output += '        ' + businessUnits[mid] + ' - ' + mid;
                output += '        </label>';
                output += '    </div>';
                output += '</div>';
            }
    
            return output;
        }
    
    
        function getFormSelectedBusinessUnits() {
            var output = [];
            var businessUnits = getAllBusinessUnits();
            for (var mid in businessUnits) {
                if (Platform.Request.GetFormField('businessUnit' + mid) == mid) {
                    output.push(mid);
                }
            }
    
            return output;
        }
    
        function getAllBusinessUnits() {
            var output = {};
            var lookup = proxy.retrieve('BusinessUnit', ['Name', 'ID'], null, null, { QueryAllAccounts: true });
    
            if (lookup.Results.length > 0) {
                for (var i = 0; i < lookup.Results.length; i ++) {
                    output[lookup.Results[i].ID.toString()] = lookup.Results[i].Name;
                }
            }
            else {
                output[Platform.Function.TreatAsContent('%%=AttributeValue("memberid")=%%')] = 'This Business Unit';
            }
    
            return output;
        }


        function getRestToken(mid, subdomain, clientId, clientSecret) {
            var url = 'https://' + subdomain + '.auth.marketingcloudapis.com/v2/token/v2/token';
            if (typeof mid == 'String') {
                mid = parseInt(mid);
            }
            var payload = {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                account_id: mid
            };
            var postData = sendPostRequest(url, payload);
            var token = postData.access_token;
            return token;
        }

        function sendPostRequest(url, payload, token) {
            var req = new Script.Util.HttpRequest(url);
            req.emptyContentHandling = 0;
            req.retries = 2;
            req.continueOnError = false;
            req.contentType = 'application/json';
            req.method = 'POST';
            if (token != null && token != undefined) {
                req.setHeader('Authorization', 'Bearer ' + token);
            }
            req.postData = Stringify(payload);
            var resp = req.send();
            var output = Platform.Function.ParseJSON(String(resp.content));
            return output;
        }
    
        if (!Platform.Request.GetFormField('formName')) {
        </script>
        <!--ACCORDION START-->
        <div class="accordion" id="accordionExample">
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingOne">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    Backlog Data Views automation
                    </button>
                </h2>
                <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                        <p>This script creates automation on selected Business Units that backlogs the Data Views tables periodically.</p>
                        <p>Below list of Data Views will be backloged:</p>
                        <ul>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_bounce.htm&type=5" target="_blank">_Bounce</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=mc_as_data_view_businessunitunsubscribes.htm&type=5"  target="_blank">_BusinessUnitUnsubscribes</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_click.htm&type=5"  target="_blank">_Click</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_complaint.htm&type=5"  target="_blank">_Complaint</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_job.htm&type=5"  target="_blank">_Job</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_journey.htm&type=5"  target="_blank">_Journey</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_journey_activity.htm&type=5"  target="_blank">_JourneyActivity</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_listsubscribers.htm&type=5"  target="_blank">_ListSubscribers</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_open.htm&type=5"  target="_blank">_Open</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_sent.htm&type=5"  target="_blank">_Sent</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_sms_message_tracking.htm&type=5"  target="_blank">_SMSMessageTracking</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_subscribers.htm&type=5"  target="_blank">_Subscribers</a></li>
                            <li><a href="https://help.salesforce.com/articleView?id=sf.mc_as_data_view_subscribers.htm&type=5"  target="_blank">_Unsubscribe</a></li>
                        </ul>
                        <p>Choose Business Units to install this automation:</p>
                        <form method="POST">
                            <ctrl:var name=businessUnitPickerHtml1 />
                            <input type="hidden" name="formName" value="dataViewsBacklog">
                            <button type="submit" id="submitDataViewsBacklog" class="btn btn-primary">Install</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingTwo">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                    Business Units and Users inventory Data Extensions
                    </button>
                </h2>
                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                        <p>This script creates two Data Extensions, Automation and optionaly - 2 SSJS Activities. To create SSJS Activies:</p>
                        <ul>
                            <li>You can either provide your REST API Credentials, that way we will create these scripts automatically and add them to automation
                                <button type="button" class="btn btn-warning"><span class="glyphicon glyphicon-warning-sign"></span> Warning</button>
                            </li>
                            <li>We can print the scripts into the results page and you can copy that code and create these scripts yourself in SFMC UI and add them to automation yourself</li>
                        </ul>
                    </div>
                </div>
            </div>
            <!--<div class="accordion-item">
                <h2 class="accordion-header" id="headingThree">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                    Script 3
                    </button>
                </h2>
                <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                        <strong>This is the third item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                    </div>
                </div>
            </div>-->
        </div>
        <!--ACCORDION END-->
        <script runat="server">
        }
        else {
        </script>
        <!--OUTPUT START-->
        <!--OUTPUT END-->
        <script runat="server">
        }
        </script>
    </div>
</body>
</html>
