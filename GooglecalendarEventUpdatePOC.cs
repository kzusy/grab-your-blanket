using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CalendarQuickstart
{
    class Program
    {
        // If modifying these scopes, delete your previously saved credentials
        // at ~/.credentials/calendar-dotnet-quickstart.json
        static string[] Scopes = { CalendarService.Scope.Calendar };
        static string ApplicationName = "Google Calendar API .NET Quickstart";

        static void Main(string[] args)
        {
            UserCredential credential;

            using (var stream =
                new FileStream("credentials.json", FileMode.Open, FileAccess.Read))
            {
                string credPath = "token.json";
                credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    GoogleClientSecrets.Load(stream).Secrets,
                    Scopes,
                    "user",
                    CancellationToken.None,
                    new FileDataStore(credPath, true)).Result;
                Console.WriteLine("Credential file saved to: " + credPath);
            }

            // Create Google Calendar API service.
            var service = new CalendarService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });

            // Define parameters of request.
            EventsResource.ListRequest request = service.Events.List("primary");
            request.TimeMin = DateTime.Now;
            request.ShowDeleted = false;
            request.SingleEvents = true;
            request.MaxResults = 10;
            request.OrderBy = EventsResource.ListRequest.OrderByEnum.StartTime;

            // List events.
            Events events = request.Execute();
            Console.WriteLine("Upcoming events:");
            if (events.Items != null && events.Items.Count > 0)
            {
                foreach (var eventItem in events.Items)
                {
                    string when = eventItem.Start.DateTime.ToString();
                    if (String.IsNullOrEmpty(when))
                    {
                        when = eventItem.Start.Date;                        

                    }
                    Console.WriteLine("{0} ({1})", eventItem.Summary, when);

                    //update event descipt tion
                    //eventItem.Description = "testttt";
                    CreateUpdateEvent("location", "MyLocation", "New title123", "2018-07-25", service, "primary");


                }
            }          
            else
            {
                Console.WriteLine("No upcoming events found.");
            }
            Console.Read();

        }
        
        public static string CreateUpdateEvent(string ExpKey, string ExpVal, string evTitle, string evDate, IClientService calService, string calID )
        {
            EventsResource er = new EventsResource(calService);
            var queryEvent = er.List(calID);
            //queryEvent.SharedExtendedProperty = ExpKey + "=" + ExpVal; //"EventKey=9999"
            var EventsList = queryEvent.Execute();

            Event ev = new Event();
            EventDateTime StartDate = new EventDateTime();
            StartDate.Date = evDate; //"2014-11-17";
            EventDateTime EndDate = new EventDateTime();
            EndDate.Date = evDate;

            ev.Start = StartDate;
            ev.End = EndDate;
            ev.Summary = evTitle; //"My Google Calendar V3 Event!";

            string FoundEventID = String.Empty;
            string FoundEventDesc = String.Empty;
            foreach (var evItem in EventsList.Items)
            {
                FoundEventID = evItem.Id;
                FoundEventDesc = evItem.Description;
            }

            if (String.IsNullOrEmpty(FoundEventID))
            {
                //If event does not exist, Append Extended Property and create the event
                Event.ExtendedPropertiesData exp = new Event.ExtendedPropertiesData();
                exp.Shared = new Dictionary<string, string>();
                exp.Shared.Add(ExpKey, ExpVal);
                ev.ExtendedProperties = exp;
                return er.Insert(ev, calID).Execute().Summary;
            }
            else
            {
                //If existing, Update the event
                ev.Description = DateTime.Now.ToLongDateString() + FoundEventDesc;
                return er.Update(ev, calID, FoundEventID).Execute().Summary;
            }
        }

    }
}
